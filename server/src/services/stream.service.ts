import { ChildProcess, spawn, execFile } from "child_process";
import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import pool from "../config/database";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

interface StreamConfig {
  /** RTSP URL including credentials */
  rtspUrl: string;
  /** WebSocket path on the server, e.g. "/api/stream" */
  wsPath: string;
}

// ──────────────────────────────────────────────
// NAL unit parser (Annex B → individual NALs)
// ──────────────────────────────────────────────

class AnnexBParser {
  private buffer: Buffer = Buffer.alloc(0);

  /**
   * Feed raw Annex B data from ffmpeg stdout.
   * Returns an array of complete NAL units (without start codes).
   */
  feed(chunk: Buffer): Buffer[] {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    const nalUnits: Buffer[] = [];
    const startPositions: number[] = [];

    // Find all start codes (0x00000001 or 0x000001)
    for (let i = 0; i < this.buffer.length - 3; i++) {
      if (
        this.buffer[i] === 0x00 &&
        this.buffer[i + 1] === 0x00 &&
        this.buffer[i + 2] === 0x01
      ) {
        // Check for 4-byte start code
        if (i > 0 && this.buffer[i - 1] === 0x00) {
          startPositions.push(i - 1);
        } else {
          startPositions.push(i);
        }
      }
    }

    // Extract complete NAL units (all but the last, which may be incomplete)
    for (let i = 0; i < startPositions.length - 1; i++) {
      const start = startPositions[i];
      const end = startPositions[i + 1];
      const nal = this.extractNAL(start, end);
      if (nal.length > 0) {
        nalUnits.push(nal);
      }
    }

    // Keep the last (possibly incomplete) NAL in the buffer
    if (startPositions.length > 0) {
      const lastStart = startPositions[startPositions.length - 1];
      // If we have extracted at least one NAL, keep from lastStart
      if (startPositions.length > 1) {
        this.buffer = this.buffer.subarray(lastStart);
      }
      // If only one start code found, keep everything (may not be complete yet)
    }

    // Prevent buffer from growing too large (safety)
    if (this.buffer.length > 5 * 1024 * 1024) {
      // 5MB max
      console.warn("[Stream] Buffer too large, resetting");
      this.buffer = Buffer.alloc(0);
    }

    return nalUnits;
  }

  private extractNAL(start: number, end: number): Buffer {
    // Skip past the start code (3 or 4 bytes)
    let dataStart = start;
    if (
      this.buffer[dataStart] === 0x00 &&
      this.buffer[dataStart + 1] === 0x00 &&
      this.buffer[dataStart + 2] === 0x00 &&
      this.buffer[dataStart + 3] === 0x01
    ) {
      dataStart += 4;
    } else {
      dataStart += 3;
    }
    return this.buffer.subarray(dataStart, end);
  }

  reset() {
    this.buffer = Buffer.alloc(0);
  }
}

// ──────────────────────────────────────────────
// Build a binary frame matching the frontend protocol:
//   [1 byte: frameType] [8 bytes: timestamp BE] [4 bytes: payloadSize BE] [payload]
// ──────────────────────────────────────────────

function buildBinaryFrame(
  frameType: number,
  timestamp: bigint,
  payload: Buffer,
): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt8(frameType, 0);
  header.writeBigUInt64BE(timestamp, 1);
  header.writeUInt32BE(payload.length, 9);
  return Buffer.concat([header, payload]);
}

// ──────────────────────────────────────────────
// Probe RTSP stream codec using ffprobe
// ──────────────────────────────────────────────

type VideoCodec = "H264" | "H265";

function probeStreamCodec(rtspUrl: string): Promise<VideoCodec> {
  return new Promise((resolve) => {
    const args = [
      "-v",
      "error",
      "-rtsp_transport",
      "tcp",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name",
      "-of",
      "csv=p=0",
      rtspUrl,
    ];

    execFile("ffprobe", args, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) {
        console.error("[Stream] ffprobe error:", stderr || err.message);
        // Default to H265 since that's common for modern IP cameras
        resolve("H265");
        return;
      }

      const codecName = stdout.trim().toLowerCase();
      console.log(`[Stream] Detected codec: ${codecName}`);

      if (codecName === "hevc" || codecName === "h265") {
        resolve("H265");
      } else {
        resolve("H264");
      }
    });
  });
}

// ──────────────────────────────────────────────
// Per-camera stream manager
// ──────────────────────────────────────────────

class CameraStream {
  private ffmpegProcess: ChildProcess | null = null;
  private parser = new AnnexBParser();
  private clients = new Set<WebSocket>();
  private startTimestamp = BigInt(0);
  private frameCount = 0;
  private isRunning = false;
  private isProbing = false;
  private restartTimeout: NodeJS.Timeout | null = null;
  private detectedCodec: VideoCodec | null = null;
  private auBuffer: Buffer[] = [];

  constructor(
    public readonly id: string,
    public readonly config: StreamConfig,
  ) {}

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    console.log(
      `[Stream:${this.id}] Client connected (total: ${this.clients.size})`,
    );

    // If codec is already known, send config immediately
    if (this.detectedCodec) {
      ws.send(JSON.stringify({ video: { codec: this.detectedCodec } }));
    }

    // Start ffmpeg if not already running
    if (!this.isRunning && !this.isProbing) {
      this.startStream();
    }

    ws.on("close", () => {
      this.clients.delete(ws);
      console.log(
        `[Stream:${this.id}] Client disconnected (total: ${this.clients.size})`,
      );

      // Stop ffmpeg if no clients
      if (this.clients.size === 0) {
        this.stopFFmpeg();
      }
    });
  }

  private async startStream() {
    if (this.isRunning || this.isProbing) return;

    // Probe the stream codec first if not detected yet
    if (!this.detectedCodec) {
      this.isProbing = true;
      console.log(
        `[Stream:${this.id}] Probing codec for ${this.config.rtspUrl}`,
      );
      this.detectedCodec = await probeStreamCodec(this.config.rtspUrl);
      this.isProbing = false;
      console.log(`[Stream:${this.id}] Using codec: ${this.detectedCodec}`);

      // Send codec config to all waiting clients
      const configMsg = JSON.stringify({
        video: { codec: this.detectedCodec },
      });
      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(configMsg);
        }
      });
    }

    // If clients disconnected during probe, don't start
    if (this.clients.size === 0) return;

    this.startFFmpeg();
  }

  private startFFmpeg() {
    if (this.isRunning) return;

    this.parser.reset();
    this.auBuffer = [];
    this.startTimestamp = BigInt(Date.now()) * BigInt(1000); // microseconds
    this.frameCount = 0;

    const codec = this.detectedCodec || "H265";
    console.log(
      `[Stream:${this.id}] Starting ffmpeg (${codec}) for ${this.config.rtspUrl}`,
    );

    // Build ffmpeg args based on detected codec
    const isH265 = codec === "H265";
    const args = [
      "-rtsp_transport",
      "tcp",
      "-fflags",
      "nobuffer",
      "-flags",
      "low_delay",
      "-analyzeduration",
      "500000",
      "-probesize",
      "500000",
      "-i",
      this.config.rtspUrl,
      "-c:v",
      "copy",
      "-an",
      "-f",
      isH265 ? "hevc" : "h264",
      "-bsf:v",
      isH265 ? "hevc_mp4toannexb" : "h264_mp4toannexb",
      "pipe:1",
    ];

    try {
      this.ffmpegProcess = spawn("ffmpeg", args, {
        stdio: ["ignore", "pipe", "pipe"],
      });
      this.isRunning = true;

      this.ffmpegProcess.stdout!.on("data", (chunk: Buffer) => {
        this.handleFFmpegData(chunk);
      });

      this.ffmpegProcess.stderr!.on("data", (data: Buffer) => {
        const line = data.toString().trim();
        // Only log important messages, not the constant progress
        if (
          line.includes("Error") ||
          line.includes("error") ||
          line.includes("Stream") ||
          line.includes("Input #") ||
          line.includes("Output #")
        ) {
          console.log(`[Stream:${this.id}] ffmpeg: ${line}`);
        }
      });

      this.ffmpegProcess.on("close", (code) => {
        console.log(`[Stream:${this.id}] ffmpeg exited with code ${code}`);
        this.isRunning = false;
        this.ffmpegProcess = null;

        // Auto-restart if clients are still connected
        if (this.clients.size > 0) {
          console.log(
            `[Stream:${this.id}] Restarting ffmpeg in 3s (${this.clients.size} clients)`,
          );
          this.restartTimeout = setTimeout(() => {
            if (this.clients.size > 0) {
              this.startStream();
            }
          }, 3000);
        }
      });

      this.ffmpegProcess.on("error", (err) => {
        console.error(`[Stream:${this.id}] ffmpeg spawn error:`, err.message);
        this.isRunning = false;

        // Notify clients about the error
        const errorMsg = JSON.stringify({
          error: true,
          reason:
            "Failed to start stream - ffmpeg not found or RTSP unreachable",
        });
        this.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(errorMsg);
          }
        });
      });
    } catch (err: any) {
      console.error(`[Stream:${this.id}] Failed to spawn ffmpeg:`, err.message);
      this.isRunning = false;
    }
  }

  private handleFFmpegData(chunk: Buffer) {
    const nalUnits = this.parser.feed(chunk);

    for (const nal of nalUnits) {
      if (nal.length === 0) continue;

      // Detect access unit boundary — flush previous AU when a new picture starts
      if (this.isNewAccessUnit(nal)) {
        this.flushAccessUnit();
      }

      this.auBuffer.push(nal);
    }
  }

  /**
   * Detects the start of a new H.265/H.264 access unit.
   * A new AU begins at AUD NALs or VCL NALs with first_slice_segment_in_pic_flag=1.
   */
  private isNewAccessUnit(nal: Buffer): boolean {
    if (nal.length < 2) return false;

    const codec = this.detectedCodec || "H265";

    if (codec === "H265") {
      const nalType = (nal[0] >> 1) & 0x3f;
      if (nalType === 35) return true; // AUD
      // VCL NAL (types 0-31): check first_slice_segment_in_pic_flag
      if (nalType <= 31 && nal.length >= 3) {
        return (nal[2] & 0x80) !== 0;
      }
    } else {
      const nalType = nal[0] & 0x1f;
      if (nalType === 9) return true; // AUD
      // VCL NAL (types 1-5): check first_mb_in_slice (exp-golomb 0 = leading 1 bit)
      if (nalType >= 1 && nalType <= 5 && nal.length >= 2) {
        return (nal[1] & 0x80) !== 0;
      }
    }

    return false;
  }

  /**
   * Flush all buffered NALs as a single access unit with a shared timestamp.
   */
  private flushAccessUnit() {
    if (this.auBuffer.length === 0) return;

    this.frameCount++;
    const timestamp =
      this.startTimestamp + BigInt(this.frameCount) * BigInt(40000); // 25fps = 40ms

    for (const nal of this.auBuffer) {
      const frame = buildBinaryFrame(0, timestamp, nal);
      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(frame);
          } catch (e) {
            console.error(`[Stream:${this.id}] Send error:`, e);
          }
        }
      });
    }

    this.auBuffer = [];
  }

  private stopFFmpeg() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.ffmpegProcess) {
      console.log(`[Stream:${this.id}] Stopping ffmpeg`);
      this.ffmpegProcess.kill("SIGTERM");

      // Force kill after 5s if still running
      setTimeout(() => {
        if (this.ffmpegProcess) {
          this.ffmpegProcess.kill("SIGKILL");
          this.ffmpegProcess = null;
        }
      }, 5000);
    }

    this.isRunning = false;
    this.flushAccessUnit();
    this.parser.reset();
    this.auBuffer = [];
  }

  destroy() {
    this.clients.forEach((client) => client.close());
    this.clients.clear();
    this.stopFFmpeg();
  }
}

// ──────────────────────────────────────────────
// Main: attach WebSocket server to HTTP/HTTPS server
// ──────────────────────────────────────────────

const cameraStreams = new Map<string, CameraStream>();

/**
 * Build an RTSP URL from database camera fields.
 * Format: rtsp://<login>:<password>@<ip>:554/cam/realmonitor?channel=1&subtype=0
 */
function buildRtspUrl(login: string, password: string, ip: string): string {
  return `rtsp://${login}:${password}@${ip}:554/cam/realmonitor?channel=1&subtype=0`;
}

/**
 * Get or create a CameraStream for a given building ID.
 * Looks up camera credentials from the database.
 */
async function getOrCreateCameraStream(
  buildingId: string,
): Promise<CameraStream | null> {
  // Return existing stream if still valid
  const existing = cameraStreams.get(buildingId);
  if (existing) return existing;

  // Look up camera info from the database
  try {
    const result = await pool.query(
      `SELECT camera_login, camera_password, camera_ip
       FROM object_card
       WHERE id = $1 AND is_deleted = FALSE
         AND camera_ip IS NOT NULL AND camera_ip != ''`,
      [buildingId],
    );

    if (result.rows.length === 0) return null;

    const { camera_login, camera_password, camera_ip } = result.rows[0];
    if (!camera_login || !camera_password || !camera_ip) return null;

    const rtspUrl = buildRtspUrl(camera_login, camera_password, camera_ip);
    const config: StreamConfig = {
      rtspUrl,
      wsPath: "/api/stream",
    };

    const stream = new CameraStream(buildingId, config);
    cameraStreams.set(buildingId, stream);
    return stream;
  } catch (err: any) {
    console.error(
      `[Stream] Failed to look up camera for building ${buildingId}:`,
      err.message,
    );
    return null;
  }
}

export function setupStreamWebSocket(server: HttpServer | HttpsServer) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade requests
  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);

    // Match /api/stream?src=<buildingId>
    if (url.pathname === "/api/stream") {
      const src = url.searchParams.get("src");
      if (!src) {
        console.warn("[Stream] No src parameter provided");
        socket.destroy();
        return;
      }

      getOrCreateCameraStream(src)
        .then((camera) => {
          if (!camera) {
            console.warn(`[Stream] No camera configured for building: ${src}`);
            socket.destroy();
            return;
          }

          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
            camera.addClient(ws);
          });
        })
        .catch((err) => {
          console.error("[Stream] Error during upgrade:", err);
          socket.destroy();
        });
    } else {
      socket.destroy();
    }
  });

  console.log("📹 Stream WebSocket server initialized");
  console.log("   Connect: ws://<host>:<port>/api/stream?src=<buildingId>");

  return wss;
}

export function destroyAllStreams() {
  cameraStreams.forEach((stream) => stream.destroy());
  cameraStreams.clear();
}

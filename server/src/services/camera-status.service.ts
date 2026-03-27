import net from 'net';
import pool from '../config/database';

type CameraStatus = 'online' | 'offline' | 'unknown';

interface CacheEntry {
  status: CameraStatus;
  checkedAt: number;
}

const cache = new Map<number, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 1 minute
const CHECK_INTERVAL_MS = 60_000;
const TCP_TIMEOUT_MS = 3_000;
const RTSP_PORT = 554;

function checkTcp(ip: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(TCP_TIMEOUT_MS);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(RTSP_PORT, ip);
  });
}

export function getCameraStatus(cameraId: number): CameraStatus {
  const entry = cache.get(cameraId);
  if (!entry) return 'unknown';
  if (Date.now() - entry.checkedAt > CACHE_TTL_MS * 2) return 'unknown';
  return entry.status;
}

async function checkAllCameras(): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT id, camera_ip FROM cameras WHERE is_deleted = FALSE'
    );

    await Promise.all(
      result.rows.map(async (row: { id: number; camera_ip: string }) => {
        const online = await checkTcp(row.camera_ip);
        cache.set(row.id, { status: online ? 'online' : 'offline', checkedAt: Date.now() });
      })
    );
  } catch (err) {
    console.error('Camera status check error:', err);
  }
}

export function startCameraStatusChecker(): void {
  // Run immediately on startup, then every minute
  checkAllCameras();
  setInterval(checkAllCameras, CHECK_INTERVAL_MS);
  console.log('📷 Camera status checker started');
}

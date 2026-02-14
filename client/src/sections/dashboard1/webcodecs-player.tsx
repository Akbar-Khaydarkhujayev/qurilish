import { useRef, useState, useEffect } from 'react';

import { Box, IconButton, Typography } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

interface IWebCodecsPlayerProps {
  wsUrl: string;
  onError?: (error: string) => void;
  autoConnect?: boolean;
}

export default function WebCodecsPlayer({
  wsUrl,
  onError,
  autoConnect = true,
}: IWebCodecsPlayerProps) {
  const { t } = useTranslate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const videoDecoderRef = useRef<VideoDecoder | null>(null);
  const isConnectedRef = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState('Ready to connect');
  const [isMuted, setIsMuted] = useState(true);

  const stateRef = useRef({
    videoFrameCount: 0,
    firstKeyFrameReceived: false,
    pendingFrames: [] as Array<{ payload: Uint8Array; timestamp: number; isKeyFrame: boolean }>,
    h265ConfigNALs: {
      vps: null as Uint8Array | null,
      sps: null as Uint8Array | null,
      pps: null as Uint8Array | null,
    },
    h264ConfigNALs: { sps: null as Uint8Array | null, pps: null as Uint8Array | null },
    nalAssemblyBuffer: null as Uint8Array[] | null,
    currentNalType: null as number | null,
    videoCodec: null as string | null,
    decoderConfigured: false,
    pendingVideoConfig: null as any,
    h265AUBuffer: [] as Uint8Array[],
    h265AUTimestamp: -1,
    h265AUHasKeyFrame: false,
  });

  useEffect(() => {
    // Check WebCodecs support
    if (typeof VideoDecoder === 'undefined') {
      setStatus(t('WebCodecs API not supported in this browser'));
      onError?.(t('WebCodecs API not supported. Use Chrome 94+ or Edge 94+'));
      return undefined;
    }

    let mounted = true;

    if (autoConnect && !isConnectedRef.current && mounted && wsUrl) {
      connectToStream();
    }

    return () => {
      mounted = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, autoConnect]);

  const connectToStream = () => {
    if (
      isConnectedRef.current ||
      (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED)
    ) {
      console.log('Already connected or connecting');
      return;
    }

    if (!wsUrl) {
      setStatus(t('Device and stream required'));
      onError?.(t('Device UUID and Stream UUID are required'));
      return;
    }

    setStatus(t('Connecting to server...'));
    console.log(`Connecting to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      isConnectedRef.current = true;
      setStatus(t("Ulandi - oqim ma'lumotlari kutilmoqda..."));
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      isConnectedRef.current = false;
      setStatus(t('Disconnected from server'));
      console.log('WebSocket closed');
    };

    ws.onerror = (error) => {
      isConnectedRef.current = false;
      setStatus(t('Connection error'));
      onError?.(t('WebSocket connection error'));
      console.error('WebSocket error:', error);
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        handleConfig(JSON.parse(event.data));
      } else {
        handleBinaryData(event.data);
      }
    };
  };

  const handleConfig = (config: any) => {
    console.log('Received config:', config);

    if (config && config.error) {
      setStatus(config.reason || t('Unsupported stream'));
      onError?.(config.reason);
      return;
    }

    // Initialize video decoder
    if (config.video) {
      const { codec } = config.video;
      stateRef.current.videoCodec = codec;
      if (codec === 'H265') {
        // Defer initialization until VPS/SPS/PPS are received from the stream
        stateRef.current.pendingVideoConfig = config.video;
        console.log('H265 detected — waiting for VPS/SPS/PPS before configuring decoder');
      } else {
        initializeVideoDecoder(config.video);
      }
    }
  };

  const initializeVideoDecoder = (videoConfig: any, descriptionBinary?: Uint8Array) => {
    const { codec } = videoConfig;
    let codecString = 'avc1.42E01E'; // Default H264

    if (codec === 'H265') {
      codecString = 'hvc1.1.6.L93.B0';
    } else if (codec === 'H264') {
      codecString = 'avc1.42E01E';
    }

    let description: Uint8Array | undefined = descriptionBinary;
    if (!description && videoConfig.description) {
      try {
        description = Uint8Array.from(atob(videoConfig.description), (c) => c.charCodeAt(0));
      } catch (e) {
        console.error('Failed to decode base64 description:', e);
      }
    }

    try {
      const decoder = new VideoDecoder({
        output: (frame) => {
          const canvas = canvasRef.current;
          if (!canvas) {
            frame.close();
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            frame.close();
            return;
          }

          // Resize canvas if needed
          if (canvas.width !== frame.displayWidth || canvas.height !== frame.displayHeight) {
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
          }

          ctx.drawImage(frame, 0, 0);
          frame.close();

          if (status !== t('Stream playing')) {
            setStatus(t('Stream playing'));
          }
        },
        error: (e) => {
          setStatus(t('Video decoder error'));
          onError?.(`${t('Video decoder error')}: ${e.message}`);
          console.error('Video decoder error:', e);
        },
      });

      const decoderConfig: VideoDecoderConfig = {
        codec: codecString,
        optimizeForLatency: true,
      };

      if (description) {
        decoderConfig.description = description;
      }

      decoder.configure(decoderConfig);
      videoDecoderRef.current = decoder;
      stateRef.current.firstKeyFrameReceived = false;
      stateRef.current.decoderConfigured = true;
      console.log('Video decoder initialized:', codecString);
    } catch (e: any) {
      setStatus(t('Failed to initialize video decoder'));
      onError?.(`${t('Failed to create video decoder')}: ${e.message}`);
      console.error('Failed to create video decoder:', e);
    }
  };

  // Build an HEVCDecoderConfigurationRecord (ISO 14496-15) from VPS/SPS/PPS NALs
  const buildHEVCDecoderConfigRecord = (
    vps: Uint8Array,
    sps: Uint8Array,
    pps: Uint8Array
  ): Uint8Array => {
    // Profile/tier/level sits at byte offset 6 inside VPS NAL:
    //   2 bytes NAL header + 4 bytes VPS preamble = 6
    const ptl = 6;
    const profileSpaceTierIdc = vps.length > ptl ? vps[ptl] : 0x60;
    const profileCompatFlags =
      vps.length > ptl + 4 ? vps.slice(ptl + 1, ptl + 5) : new Uint8Array([0x60, 0, 0, 0]);
    const constraintFlags =
      vps.length > ptl + 10 ? vps.slice(ptl + 5, ptl + 11) : new Uint8Array(6);
    const levelIdc = vps.length > ptl + 11 ? vps[ptl + 11] : 93;

    const naluArrays = [
      { type: 32, nalus: [vps] }, // VPS
      { type: 33, nalus: [sps] }, // SPS
      { type: 34, nalus: [pps] }, // PPS
    ];

    // Calculate total size: 23 byte fixed header + per-array overhead + NAL data
    const size = naluArrays.reduce(
      (total, arr) => total + 3 + arr.nalus.reduce((s, n) => s + 2 + n.length, 0),
      23
    );

    const buf = new Uint8Array(size);
    const view = new DataView(buf.buffer);
    let off = 0;

    buf[off] = 1; // configurationVersion
    off += 1;
    buf[off] = profileSpaceTierIdc;
    off += 1;
    buf.set(profileCompatFlags, off);
    off += 4;
    buf.set(constraintFlags, off);
    off += 6;
    buf[off] = levelIdc;
    off += 1;
    view.setUint16(off, 0xf000); // min_spatial_segmentation_idc = 0
    off += 2;
    buf[off] = 0xfc; // parallelismType = 0
    off += 1;
    // eslint-disable-next-line no-bitwise
    buf[off] = 0xfc | 1; // chromaFormat = 1 (4:2:0)
    off += 1;
    buf[off] = 0xf8; // bitDepthLumaMinus8 = 0
    off += 1;
    buf[off] = 0xf8; // bitDepthChromaMinus8 = 0
    off += 1;
    view.setUint16(off, 0); // avgFrameRate = 0
    off += 2;
    // constantFrameRate=0 | numTemporalLayers=1 | temporalIdNested=1 | lengthSizeMinusOne=3
    buf[off] = 0x0f;
    off += 1;
    buf[off] = naluArrays.length; // numOfArrays
    off += 1;

    naluArrays.forEach((arr) => {
      // eslint-disable-next-line no-bitwise
      buf[off] = 0x80 | arr.type;
      off += 1;
      view.setUint16(off, arr.nalus.length);
      off += 2;
      arr.nalus.forEach((nalu) => {
        view.setUint16(off, nalu.length);
        off += 2;
        buf.set(nalu, off);
        off += nalu.length;
      });
    });

    return buf.slice(0, off);
  };

  // Once VPS + SPS + PPS are all captured, build description and configure decoder
  const tryConfigureH265Decoder = () => {
    const state = stateRef.current;
    if (state.decoderConfigured) return;
    const { vps, sps, pps } = state.h265ConfigNALs;
    if (!vps || !sps || !pps) return;

    console.log('VPS/SPS/PPS received — building HEVCDecoderConfigurationRecord');
    const description = buildHEVCDecoderConfigRecord(vps, sps, pps);
    initializeVideoDecoder(state.pendingVideoConfig || { codec: 'H265' }, description);
  };

  const handleBinaryData = (arrayBuffer: ArrayBuffer) => {
    const dv = new DataView(arrayBuffer);

    if (dv.byteLength < 13) {
      console.warn('Binary data too small:', dv.byteLength);
      return;
    }

    const frameType = dv.getUint8(0); // 0 = video, 1 = audio
    const timestamp = Number(dv.getBigUint64(1, false));
    const payloadSize = dv.getUint32(9, false);
    const payload = new Uint8Array(arrayBuffer, 13, payloadSize);

    // Handle video frames — always pass through for H265 so VPS/SPS/PPS are captured
    if (frameType === 0) {
      handleVideoFrame(payload, timestamp);
    }
  };

  const handleVideoFrame = (payload: Uint8Array, timestamp: number) => {
    const state = stateRef.current;

    if (state.videoCodec === 'H265') {
      handleH265Frame(payload, timestamp);
    } else if (state.videoCodec === 'H264') {
      if (!videoDecoderRef.current || videoDecoderRef.current.state !== 'configured') return;
      handleH264Frame(payload, timestamp);
    }
  };

  const handleH265Frame = (payload: Uint8Array, timestamp: number) => {
    const state = stateRef.current;

    if (payload.length >= 2) {
      // eslint-disable-next-line no-bitwise
      const nalHeader = (payload[0] << 8) | payload[1];
      // eslint-disable-next-line no-bitwise
      const nalType = (nalHeader >> 9) & 0x3f;

      if (nalType === 32) {
        // VPS
        state.h265ConfigNALs.vps = new Uint8Array(payload);
        tryConfigureH265Decoder();
        return;
      }
      if (nalType === 33) {
        // SPS
        state.h265ConfigNALs.sps = new Uint8Array(payload);
        tryConfigureH265Decoder();
        return;
      }
      if (nalType === 34) {
        // PPS
        state.h265ConfigNALs.pps = new Uint8Array(payload);
        tryConfigureH265Decoder();
        return;
      }

      if (nalType === 49) {
        // FU (fragmentation unit)
        handleH265FragmentedPacket(payload, timestamp);
        return;
      }
      if (nalType === 48) {
        // Aggregation Packet (AP)
        let off = 2;
        while (off + 2 <= payload.length) {
          // eslint-disable-next-line no-bitwise
          const len = (payload[off] << 8) | payload[off + 1];
          off += 2;
          if (off + len > payload.length) break;
          const nal = payload.slice(off, off + len);
          processCompleteNAL(nal, timestamp, state.videoCodec!);
          off += len;
        }
        return;
      }
    }

    processCompleteNAL(payload, timestamp, state.videoCodec!);
  };

  const handleH264Frame = (payload: Uint8Array, timestamp: number) => {
    const state = stateRef.current;

    if (payload.length >= 1) {
      // eslint-disable-next-line no-bitwise
      const nalType = payload[0] & 0x1f;

      if (nalType === 7) {
        // SPS
        state.h264ConfigNALs.sps = new Uint8Array(payload);
        return;
      }
      if (nalType === 8) {
        // PPS
        state.h264ConfigNALs.pps = new Uint8Array(payload);
        return;
      }
      if (nalType === 28) {
        // FU-A
        handleH264FragmentedPacket(payload, timestamp);
        return;
      }
      if (nalType === 24) {
        // STAP-A (Aggregation)
        let off = 1;
        while (off + 2 <= payload.length) {
          // eslint-disable-next-line no-bitwise
          const len = (payload[off] << 8) | payload[off + 1];
          off += 2;
          if (off + len > payload.length) break;
          const nal = payload.slice(off, off + len);
          processCompleteNAL(nal, timestamp, state.videoCodec!);
          off += len;
        }
        return;
      }
    }

    processCompleteNAL(payload, timestamp, state.videoCodec!);
  };

  const handleH265FragmentedPacket = (payload: Uint8Array, timestamp: number) => {
    const state = stateRef.current;
    if (payload.length < 3) return;

    const fuHeader = payload[2];
    // eslint-disable-next-line no-bitwise
    const startBit = (fuHeader & 0x80) !== 0;
    // eslint-disable-next-line no-bitwise
    const endBit = (fuHeader & 0x40) !== 0;
    // eslint-disable-next-line no-bitwise
    const fuNalType = fuHeader & 0x3f;

    if (startBit) {
      state.currentNalType = fuNalType;
      const newNalHeader = new Uint8Array(2);
      // eslint-disable-next-line no-bitwise
      newNalHeader[0] = (fuNalType << 1) | (payload[0] & 0x81);
      newNalHeader[1] = payload[1];
      state.nalAssemblyBuffer = [newNalHeader, payload.slice(3)];
    } else if (state.nalAssemblyBuffer && fuNalType === state.currentNalType) {
      state.nalAssemblyBuffer.push(payload.slice(3));

      if (endBit) {
        const completeNAL = concatenateArrays(state.nalAssemblyBuffer);
        processCompleteNAL(completeNAL, timestamp, state.videoCodec!);
        state.nalAssemblyBuffer = null;
        state.currentNalType = null;
      }
    }
  };

  const handleH264FragmentedPacket = (payload: Uint8Array, timestamp: number) => {
    const state = stateRef.current;
    if (payload.length < 2) return;

    const fuHeader = payload[1];
    // eslint-disable-next-line no-bitwise
    const startBit = (fuHeader & 0x80) !== 0;
    // eslint-disable-next-line no-bitwise
    const endBit = (fuHeader & 0x40) !== 0;
    // eslint-disable-next-line no-bitwise
    const fuNalType = fuHeader & 0x1f;

    if (startBit) {
      state.currentNalType = fuNalType;
      const nalHeader = new Uint8Array(1);
      // eslint-disable-next-line no-bitwise
      nalHeader[0] = (payload[0] & 0xe0) | fuNalType;
      state.nalAssemblyBuffer = [nalHeader, payload.slice(2)];
    } else if (state.nalAssemblyBuffer && fuNalType === state.currentNalType) {
      state.nalAssemblyBuffer.push(payload.slice(2));

      if (endBit) {
        const completeNAL = concatenateArrays(state.nalAssemblyBuffer);
        processCompleteNAL(completeNAL, timestamp, state.videoCodec!);
        state.nalAssemblyBuffer = null;
        state.currentNalType = null;
      }
    }
  };

  // H265: buffer VCL NALs and flush as complete access units (one per picture)
  const flushH265AccessUnit = () => {
    const state = stateRef.current;
    if (state.h265AUBuffer.length === 0) return;

    if (!videoDecoderRef.current || videoDecoderRef.current.state !== 'configured') {
      state.h265AUBuffer = [];
      state.h265AUHasKeyFrame = false;
      return;
    }

    const isKeyFrame = state.h265AUHasKeyFrame;
    const { h265AUTimestamp } = state;

    // Wait for first keyframe before decoding
    if (!state.firstKeyFrameReceived) {
      if (!isKeyFrame) {
        state.h265AUBuffer = [];
        state.h265AUHasKeyFrame = false;
        return;
      }
      state.firstKeyFrameReceived = true;
    }

    // Build HVCC data: 4-byte length-prefixed NALs
    const nalUnits: Uint8Array[] = [];
    const pushLenPrefixed = (nal: Uint8Array) => {
      const len = nal.length;
      const buf = new Uint8Array(4 + len);
      // eslint-disable-next-line no-bitwise
      buf[0] = (len >>> 24) & 0xff;
      // eslint-disable-next-line no-bitwise
      buf[1] = (len >>> 16) & 0xff;
      // eslint-disable-next-line no-bitwise
      buf[2] = (len >>> 8) & 0xff;
      // eslint-disable-next-line no-bitwise
      buf[3] = len & 0xff;
      buf.set(nal, 4);
      nalUnits.push(buf);
    };

    // Prepend VPS/SPS/PPS for keyframes
    if (
      isKeyFrame &&
      state.h265ConfigNALs.vps &&
      state.h265ConfigNALs.sps &&
      state.h265ConfigNALs.pps
    ) {
      pushLenPrefixed(state.h265ConfigNALs.vps);
      pushLenPrefixed(state.h265ConfigNALs.sps);
      pushLenPrefixed(state.h265ConfigNALs.pps);
    }

    // Add all VCL NALs from the access unit
    state.h265AUBuffer.forEach((nal) => pushLenPrefixed(nal));

    // Concatenate
    const total = nalUnits.reduce((s, n) => s + n.length, 0);
    const data = new Uint8Array(total);
    let off = 0;
    nalUnits.forEach((n) => {
      data.set(n, off);
      off += n.length;
    });

    try {
      const chunk = new EncodedVideoChunk({
        type: isKeyFrame ? 'key' : 'delta',
        timestamp: h265AUTimestamp,
        data,
      });
      videoDecoderRef.current.decode(chunk);
      state.videoFrameCount += 1;
    } catch (e) {
      console.error('Failed to decode H265 access unit:', e);
    }

    state.h265AUBuffer = [];
    state.h265AUHasKeyFrame = false;
  };

  const bufferH265NAL = (payload: Uint8Array, timestamp: number) => {
    const state = stateRef.current;
    if (payload.length < 2) return;

    // eslint-disable-next-line no-bitwise
    const nalType = (payload[0] >> 1) & 0x3f;

    // Skip non-VCL NALs (SEI, AUD, filler — types >= 32 already handled upstream)
    if (nalType >= 32) return;

    // Check if this is the first slice of a new picture (first_slice_segment_in_pic_flag)
    // eslint-disable-next-line no-bitwise
    const isFirstSlice = payload.length >= 3 && (payload[2] & 0x80) !== 0;

    // If a new picture starts, flush the previous access unit
    if (isFirstSlice && state.h265AUBuffer.length > 0) {
      flushH265AccessUnit();
    }

    // Track keyframe status (IDR, CRA, BLA = NAL types 16-21)
    const isKeyFrame = nalType >= 16 && nalType <= 21;
    if (state.h265AUBuffer.length === 0) {
      state.h265AUHasKeyFrame = isKeyFrame;
    } else if (isKeyFrame) {
      state.h265AUHasKeyFrame = true;
    }

    state.h265AUBuffer.push(new Uint8Array(payload));
    state.h265AUTimestamp = timestamp;
  };

  const processCompleteNAL = (payload: Uint8Array, timestamp: number, codec: string) => {
    // For H265, route to access unit buffer for proper multi-slice frame grouping
    if (codec === 'H265') {
      bufferH265NAL(payload, timestamp);
      return;
    }

    // H264 path
    const state = stateRef.current;
    const isKeyFrame = detectKeyFrame(payload, codec);

    if (!state.firstKeyFrameReceived) {
      if (isKeyFrame) {
        state.firstKeyFrameReceived = true;
        state.pendingFrames = [];
        decodeVideoFrame(payload, timestamp, true);
      } else if (state.pendingFrames.length < 100) {
        state.pendingFrames.push({
          payload: new Uint8Array(payload),
          timestamp,
          isKeyFrame: false,
        });
      }
    } else {
      decodeVideoFrame(payload, timestamp, isKeyFrame);
    }
  };

  const decodeVideoFrame = (payload: Uint8Array, timestamp: number, isKeyFrame: boolean) => {
    const state = stateRef.current;
    let data = payload;

    // H264: wrap NALs with 4-byte length prefixes, prepend SPS/PPS for keyframes
    if (state.videoCodec === 'H264') {
      const nalUnits: Uint8Array[] = [];
      const pushLenPrefixed = (nal: Uint8Array) => {
        const len = nal.length;
        const buf = new Uint8Array(4 + len);
        // eslint-disable-next-line no-bitwise
        buf[0] = (len >>> 24) & 0xff;
        // eslint-disable-next-line no-bitwise
        buf[1] = (len >>> 16) & 0xff;
        // eslint-disable-next-line no-bitwise
        buf[2] = (len >>> 8) & 0xff;
        // eslint-disable-next-line no-bitwise
        buf[3] = len & 0xff;
        buf.set(nal, 4);
        nalUnits.push(buf);
      };

      if (isKeyFrame && state.h264ConfigNALs.sps && state.h264ConfigNALs.pps) {
        pushLenPrefixed(state.h264ConfigNALs.sps);
        pushLenPrefixed(state.h264ConfigNALs.pps);
      }
      pushLenPrefixed(payload);

      const total = nalUnits.reduce((s, n) => s + n.length, 0);
      data = new Uint8Array(total);
      let off = 0;
      nalUnits.forEach((n) => {
        data.set(n, off);
        off += n.length;
      });
    }

    try {
      const chunk = new EncodedVideoChunk({
        type: isKeyFrame ? 'key' : 'delta',
        timestamp,
        data,
      });
      if (!videoDecoderRef.current || videoDecoderRef.current.state !== 'configured') return;
      videoDecoderRef.current.decode(chunk);
      state.videoFrameCount += 1;
    } catch (e) {
      console.error('Failed to decode video chunk:', e);
    }
  };

  const detectKeyFrame = (payload: Uint8Array, codec: string): boolean => {
    if (!payload || payload.length < 2) return false;

    if (codec === 'H264') {
      // For H264, check NAL unit type in first byte
      // eslint-disable-next-line no-bitwise
      const nalType = payload[0] & 0x1f;
      // NAL type 5 = IDR (key frame), 7 = SPS, 8 = PPS
      return nalType === 5 || nalType === 7 || nalType === 8;
    }

    if (codec === 'H265') {
      // For H265, NAL type is in bits 9-14 of the first two bytes
      // eslint-disable-next-line no-bitwise
      const nalHeader = (payload[0] << 8) | payload[1];
      // eslint-disable-next-line no-bitwise
      const nalType = (nalHeader >> 9) & 0x3f;
      // NAL types 16-21 are key frames (IDR, CRA, BLA, etc.)
      return nalType >= 16 && nalType <= 21;
    }

    return false;
  };

  const concatenateArrays = (arrays: Uint8Array[]): Uint8Array => {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    arrays.forEach((arr) => {
      result.set(arr, offset);
      offset += arr.length;
    });
    return result;
  };

  const cleanup = () => {
    isConnectedRef.current = false;

    if (videoDecoderRef.current) {
      try {
        videoDecoderRef.current.close();
      } catch (e) {
        console.warn('Error closing video decoder:', e);
      }
      videoDecoderRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn('Error closing WebSocket:', e);
      }
      wsRef.current = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    stateRef.current = {
      videoFrameCount: 0,
      firstKeyFrameReceived: false,
      pendingFrames: [],
      h265ConfigNALs: { vps: null, sps: null, pps: null },
      h264ConfigNALs: { sps: null, pps: null },
      nalAssemblyBuffer: null,
      currentNalType: null,
      videoCodec: null,
      decoderConfigured: false,
      pendingVideoConfig: null,
      h265AUBuffer: [],
      h265AUTimestamp: -1,
      h265AUHasKeyFrame: false,
    };
  };

  const toggleFullscreen = () => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 4,
        aspectRatio: '16/9',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
        width={1920}
        height={1080}
      />

      {/* Status Overlay */}
      {status !== t('Stream playing') && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            px: 3,
            py: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="body1">{status}</Typography>
        </Box>
      )}

      {/* Controls Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'transparent',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'end', gap: 2, alignItems: 'center' }}>
          <IconButton
            onClick={() => setIsMuted(!isMuted)}
            sx={{
              p: 1,
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            {isMuted ? (
              <Iconify icon="maktab:solar-volume-loud-bold" width={24} height={24} />
            ) : (
              <Iconify icon="maktab:solar-volume-cross-bold" width={24} height={24} />
            )}
          </IconButton>
          <IconButton
            onClick={toggleFullscreen}
            sx={{ p: 1, color: 'white', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }}
          >
            {isFullscreen ? (
              <Iconify icon="maktab:solar-quit-full-screen-outline" width={24} height={24} />
            ) : (
              <Iconify icon="maktab:solar-full-screen-outline" width={24} height={24} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

import { useEffect, useRef } from 'react';
import { getMeetingSession } from '@/utils/meetingSession';
import { getAudioContext } from '../utils/meetingAlert';
// 오디오 스레드에서 도는 파일이라 별도 파일로 내보내고 주소만 받음 (Vite ?worker&url)
import workletUrl from '../utils/pcmRecorderWorklet.js?worker&url';

// WS-02 음성 송출
// - 연결 직후 audio.start(16kHz, LINEAR16, mono)를 텍스트로 한 번 보내고, 이후 PCM 청크(200ms)를 바이너리로 보냄
// - 회의가 시작된 뒤에만 연결 (대기 중 소리는 서버가 버림). 일시 정지 중에도 연결은 유지
// - 마이크를 끄면 트랙이 멈춰 무음이 나감
// - 끊기면 다시 연결 (1초, 2초, 4초, 8초, 그 뒤로 10초마다)
// - 다시 연결 안 하는 close code
//   4401 토큰 없음·만료, 4404 회의 없음, 4410 회의 종료됨 (WS-01에서 화면 이동 처리)
//   4409 같은 참가자가 다른 기기에서 음성을 보내기 시작함 → 이 기기는 송출 중단
//   1008 audio.start 형식 오류
// - 연결이 끊긴 동안의 소리는 최대 10분까지 모아 두었다가, 다시 연결되면 이어서 보냄
//   audio.start의 startOffsetMs = 모아 둔 첫 청크의 녹음 위치 (첫 연결은 null)
//   녹음 위치는 회의 경과 시간(일시 정지 제외)이라, 일시 정지 중 소리는 모으지 않음 (서버도 버림)
const WS_URL = import.meta.env.VITE_WS_URL;
const SAMPLE_RATE = 16000;
const CHUNK_MS = 200;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000];
const MAX_RECONNECT_DELAY_MS = 10000;
const NO_RECONNECT_CODES = new Set([4401, 4404, 4409, 4410, 1008]);
// 끊긴 동안 모아 둘 최대 청크 수: 10분 (200ms × 3000 = 약 19MB, WS-02 클라이언트 버퍼)
const MAX_BUFFER_CHUNKS = (10 * 60 * 1000) / CHUNK_MS;

// getRecordingPosition: () => { offsetMs, isRecording } 지금 녹음 위치(ms)와 진행 중 여부
export const useAudioStream = ({
  meetingId,
  enabled,
  stream,
  getRecordingPosition,
}) => {
  // 소켓을 다시 열지 않도록 최신 함수만 ref에 둠
  const getPositionRef = useRef(getRecordingPosition);
  useEffect(() => {
    getPositionRef.current = getRecordingPosition;
  });

  useEffect(() => {
    if (!enabled || !stream) return undefined;

    const context = getAudioContext();
    if (!context?.audioWorklet) return undefined;

    let socket = null;
    let retryId = null;
    let attempt = 0;
    let isStopped = false;
    let source = null;
    let recorder = null;
    let silentOutput = null;
    // 한 번이라도 연결됐는지 (첫 연결 전 소리는 버림)
    let hasOpened = false;
    // 끊긴 동안 모은 청크: { offsetMs, data }
    let buffer = [];

    const connect = () => {
      const token = getMeetingSession(meetingId)?.accessToken;
      if (!token || isStopped) return;

      socket = new WebSocket(
        `${WS_URL}/ws/meetings/${meetingId}/audio?token=${encodeURIComponent(token)}`,
      );
      socket.binaryType = 'arraybuffer';

      socket.onopen = () => {
        attempt = 0;
        const startOffsetMs =
          hasOpened && buffer.length > 0 ? buffer[0].offsetMs : null;
        hasOpened = true;

        socket.send(
          JSON.stringify({
            type: 'audio.start',
            sampleRate: SAMPLE_RATE,
            encoding: 'LINEAR16',
            channels: 1,
            startOffsetMs,
          }),
        );
        // 끊긴 동안 모은 소리를 먼저 보내고, 이어서 실시간 소리
        buffer.forEach((chunk) => socket.send(chunk.data));
        buffer = [];
      };

      socket.onclose = (event) => {
        if (isStopped || NO_RECONNECT_CODES.has(event.code)) return;
        const delay = RECONNECT_DELAYS_MS[attempt] ?? MAX_RECONNECT_DELAY_MS;
        attempt += 1;
        retryId = setTimeout(connect, delay);
      };
    };

    // 마이크 → 16kHz PCM 변환(AudioWorklet) → 소켓
    const start = async () => {
      await context.audioWorklet.addModule(workletUrl);
      if (isStopped) return;

      // 입장 버튼에서 이미 깨웠으면 그대로, 아니면 첫 터치 때 깨어남 (useMeetingAlerts)
      context.resume().catch(() => {});

      source = context.createMediaStreamSource(stream);
      recorder = new AudioWorkletNode(context, 'pcm-recorder', {
        processorOptions: { targetSampleRate: SAMPLE_RATE, chunkMs: CHUNK_MS },
      });
      // 스피커로 목소리가 나오지 않게 음량 0으로 연결
      silentOutput = context.createGain();
      silentOutput.gain.value = 0;
      source
        .connect(recorder)
        .connect(silentOutput)
        .connect(context.destination);

      recorder.port.onmessage = (event) => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(event.data);
          return;
        }
        // 한 번 연결된 뒤 끊긴 동안만, 진행 중일 때만 모음
        if (!hasOpened) return;
        const position = getPositionRef.current?.();
        if (!position?.isRecording) return;

        // 청크는 방금까지의 200ms라 시작 위치는 지금 위치 - 200ms
        buffer.push({
          offsetMs: Math.max(0, Math.round(position.offsetMs - CHUNK_MS)),
          data: event.data,
        });
        if (buffer.length > MAX_BUFFER_CHUNKS) buffer.shift();
      };

      connect();
    };

    start().catch(() => {
      // AudioWorklet을 쓸 수 없는 브라우저는 송출하지 않음
    });

    return () => {
      isStopped = true;
      clearTimeout(retryId);
      socket?.close(1000);
      if (recorder) recorder.port.onmessage = null;
      source?.disconnect();
      recorder?.disconnect();
      silentOutput?.disconnect();
    };
  }, [meetingId, enabled, stream]);
};

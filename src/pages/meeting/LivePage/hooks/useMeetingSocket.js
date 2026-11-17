import { useEffect, useRef } from 'react';
import { getMeetingSession } from '@/utils/meetingSession';

const WS_URL = import.meta.env.VITE_WS_URL;
const PING_INTERVAL_MS = 25000;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000];
const MAX_RECONNECT_DELAY_MS = 10000;
const NO_RECONNECT_CODES = new Set([4401, 4404, 4410]);

const send = (socket, type, data) => {
  if (socket?.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(data === undefined ? { type } : { type, data }));
};

export const useMeetingSocket = ({
  meetingId,
  enabled,
  onEvent,
  onOpen,
  onClose,
}) => {
  // 콜백이 바뀌어도 소켓을 다시 열지 않도록 최신 콜백만 ref에 둠
  const handlersRef = useRef({ onEvent, onOpen, onClose });
  useEffect(() => {
    handlersRef.current = { onEvent, onOpen, onClose };
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let socket = null;
    let pingId = null;
    let retryId = null;
    let attempt = 0;
    let isClosedByClient = false;

    const connect = () => {
      const token = getMeetingSession(meetingId)?.accessToken;
      if (!token) {
        handlersRef.current.onClose?.({ code: 4401, willReconnect: false });
        return;
      }

      socket = new WebSocket(
        `${WS_URL}/ws/meetings/${meetingId}?token=${encodeURIComponent(token)}`,
      );

      socket.onopen = () => {
        const isReconnect = attempt > 0;
        attempt = 0;
        pingId = setInterval(() => send(socket, 'ping'), PING_INTERVAL_MS);
        handlersRef.current.onOpen?.({ isReconnect });
      };

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === 'pong') return;
        handlersRef.current.onEvent?.(message);
      };

      socket.onclose = (event) => {
        clearInterval(pingId);
        if (isClosedByClient) return;

        const willReconnect = !NO_RECONNECT_CODES.has(event.code);
        handlersRef.current.onClose?.({ code: event.code, willReconnect });
        if (!willReconnect) return;

        const delay = RECONNECT_DELAYS_MS[attempt] ?? MAX_RECONNECT_DELAY_MS;
        attempt += 1;
        retryId = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isClosedByClient = true;
      clearInterval(pingId);
      clearTimeout(retryId);
      socket?.close(1000);
    };
  }, [meetingId, enabled]);
};

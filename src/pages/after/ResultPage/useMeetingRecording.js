import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecording } from '@/api/meeting';
import { goToNoResultAccess } from '@/pages/after/ExpiredLinkPage/expiredLinkReason';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { mockResult } from './mockResult';

export const RECORDING_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
  // 보관 기간이 지남 (410 RECORDING_EXPIRED). 서버 값이 아니라 화면에서만 쓴다
  EXPIRED: 'EXPIRED',
};

const POLLING_INTERVAL_MS = 3000;
// 재생 주소가 계속 실패해도 너무 자주 다시 부르지 않는다.
const REFRESH_MIN_INTERVAL_MS = 10000;

const MOCK_RECORDING = {
  status: RECORDING_STATUS.READY,
  url: mockResult.audioUrl,
  durationSeconds: mockResult.recordingSeconds,
};

const EMPTY_RECORDING = { status: null, url: null, durationSeconds: null };

// API-13 녹음 조회
// 회의가 끝나면 서버가 기기별 녹음을 하나로 합치는 동안(PROCESSING) 3초마다 다시 확인한다.
// status가 null이면 아직 첫 응답을 받기 전이다.
// isLocked: 종료 후 기간이 지나 잠겼으면 녹음을 받지 않는다.
export const useMeetingRecording = (meetingId, { isMock, isLocked }) => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const [recording, setRecording] = useState(
    isMock ? MOCK_RECORDING : EMPTY_RECORDING,
  );
  // 재생 주소가 만료되어 새 주소를 받는 중
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);

  // 오프라인이면 멈췄다가 다시 연결되면 이어서 부른다.
  const shouldFetch =
    !isMock &&
    !isLocked &&
    isOnline &&
    (recording.status === null ||
      recording.status === RECORDING_STATUS.PROCESSING ||
      isRefreshing);

  useEffect(() => {
    if (!shouldFetch) return undefined;

    let ignore = false;
    let timerId;

    const load = async () => {
      try {
        const data = await getRecording(meetingId);
        if (ignore) return;

        if (data.status === RECORDING_STATUS.PROCESSING) {
          setRecording({ ...EMPTY_RECORDING, status: data.status });
          timerId = setTimeout(load, POLLING_INTERVAL_MS);
          return;
        }

        setRecording({
          status: data.status,
          url: data.url,
          durationSeconds:
            data.durationMs == null ? null : data.durationMs / 1000,
        });
        setIsRefreshing(false);
      } catch (error) {
        if (ignore) return;
        const code = error.response?.status;
        if (code === 401) {
          goToNoResultAccess(navigate);
          return;
        }
        // 보관 기간이 지남 → 결제 잠금 창
        if (code === 410) {
          setRecording({
            ...EMPTY_RECORDING,
            status: RECORDING_STATUS.EXPIRED,
          });
          setIsRefreshing(false);
          return;
        }
        // 네트워크·서버 오류는 잠시 뒤 다시 부른다.
        timerId = setTimeout(load, POLLING_INTERVAL_MS);
      }
    };

    load();

    return () => {
      ignore = true;
      clearTimeout(timerId);
    };
  }, [meetingId, shouldFetch, navigate]);

  // 재생 주소(1시간)가 만료되거나 403이 나면 다시 불러 주소만 바꾼다.
  const refreshUrl = () => {
    if (isMock || recording.status !== RECORDING_STATUS.READY) return;
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_MIN_INTERVAL_MS) return;
    lastRefreshRef.current = now;
    setIsRefreshing(true);
  };

  return { ...recording, refreshUrl };
};

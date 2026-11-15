import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetingState } from '@/api/meeting';
import { getMeetingSession } from '@/utils/meetingSession';
import { mockMeeting } from '../mockMeeting';

const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// API-04 응답 + 화면에 필요한 값
const toLiveMeeting = (data, session) => ({
  ...data,
  // API-02 응답에서만 받아서 저장해둔 값 (회의를 만든 진행자만 있음)
  hostRecoveryKey: session?.hostRecoveryKey ?? null,
  partialTranscript: null,
  timer: { ...data.timer, receivedAt: Date.now() },
});

// API-04로 회의 상태를 불러오고, 이후 WebSocket 이벤트의 timer로 스냅샷 교체
export const useLiveMeeting = (meetingId) => {
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(() =>
    USE_MOCK
      ? {
          ...mockMeeting,
          timer: { ...mockMeeting.timer, receivedAt: Date.now() },
        }
      : null,
  );

  // 연결 상태
  // - 'loading': 처음 불러오는 중 → 로딩 화면
  // - 'connected': 회의 화면
  // - 'reconnecting': 끊겨서 다시 연결 중 → 로딩 화면
  // - 'error': 없는 회의, 서버·네트워크 오류 → 에러 화면
  // TODO: WS-01이 끊기면 'reconnecting'
  const [connection, setConnection] = useState(
    USE_MOCK ? 'connected' : 'loading',
  );

  useEffect(() => {
    if (USE_MOCK) return undefined;

    // 저장된 토큰이 없으면 Sign In부터
    const session = getMeetingSession(meetingId);
    if (!session?.accessToken) {
      navigate(`/m/${meetingId}`, { replace: true });
      return undefined;
    }

    let ignore = false;

    getMeetingState(meetingId)
      .then((data) => {
        if (ignore) return;

        if (data.status === 'ENDED') {
          navigate(`/result/${meetingId}`, { replace: true });
          return;
        }
        setMeeting(toLiveMeeting(data, session));
        setConnection('connected');
      })
      .catch((error) => {
        if (ignore) return;
        // 토큰 만료·다른 회의 토큰 → 저장된 토큰은 instance.js에서 지움. 다시 Sign In
        if (error.response?.status === 401) {
          navigate(`/m/${meetingId}`, { replace: true });
          return;
        }
        setConnection('error');
      });

    return () => {
      ignore = true;
    };
  }, [meetingId, navigate]);

  // 시간을 새 스냅샷으로 고정
  const replaceTimer = (prev, currentTimer, status) => ({
    ...prev,
    status,
    timer: {
      ...prev.timer,
      status,
      totalElapsedSeconds: currentTimer.totalElapsedSeconds,
      agendaElapsedSeconds: currentTimer.agendaElapsedSeconds,
      receivedAt: Date.now(),
    },
  });

  // TODO: API-05 POST /meetings/{meetingId}/pause → 응답 data.timer 적용
  const pause = useCallback((currentTimer) => {
    setMeeting((prev) => replaceTimer(prev, currentTimer, 'PAUSED'));
  }, []);

  // TODO: API-06 POST /meetings/{meetingId}/resume → 응답 data.timer 적용
  const resume = useCallback((currentTimer) => {
    setMeeting((prev) => replaceTimer(prev, currentTimer, 'IN_PROGRESS'));
  }, []);

  // TODO: 실제 마이크 켜고 끄기 + WS-01 mic.status 전송
  const toggleMic = useCallback(() => {
    setMeeting((prev) => ({
      ...prev,
      me: { ...prev.me, micState: prev.me.micState === 'ON' ? 'OFF' : 'ON' },
    }));
  }, []);

  // 닫기 버튼, 자동 닫힘
  const closeOfftopic = useCallback(() => {
    setMeeting((prev) => ({ ...prev, activeOfftopicEvent: null }));
  }, []);

  // 관련 있는 이야기에요. → 모든 화면에서 닫힘
  const dismissOfftopic = useCallback(() => {
    setMeeting((prev) => ({ ...prev, activeOfftopicEvent: null }));
  }, []);

  return {
    connection,
    meeting,
    pause,
    resume,
    toggleMic,
    closeOfftopic,
    dismissOfftopic,
  };
};

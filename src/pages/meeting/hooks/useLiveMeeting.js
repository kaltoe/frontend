import { useCallback, useState } from 'react';
import { mockMeeting } from '../mockMeeting';

// API호출로 바꾸고 응답 & WebSocket 이벤트의 timer로 스냅샷 교체
export const useLiveMeeting = () => {
  const [meeting, setMeeting] = useState(mockMeeting);

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

  return { meeting, pause, resume, toggleMic };
};

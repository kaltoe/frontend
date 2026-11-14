import { useEffect, useRef } from 'react';
import {
  playMeetingAlert,
  unlockMeetingAlert,
} from '@/pages/meeting/utils/meetingAlert';

// 회의 중 알림음 (참여자 모두에게)
// - 전체 남은 시간이 0 (#23)
// - 사담 경고 (#35)
export const useMeetingAlerts = ({
  totalRemainingSeconds,
  offtopicEventId,
}) => {
  // 첫 터치, 키 입력 시 오디오 설정
  useEffect(() => {
    const events = ['pointerdown', 'keydown'];
    events.forEach((event) =>
      window.addEventListener(event, unlockMeetingAlert),
    );
    return () =>
      events.forEach((event) =>
        window.removeEventListener(event, unlockMeetingAlert),
      );
  }, []);

  const prevRemainingRef = useRef(totalRemainingSeconds);
  useEffect(() => {
    const prev = prevRemainingRef.current;
    prevRemainingRef.current = totalRemainingSeconds;
    if (prev > 0 && totalRemainingSeconds <= 0) playMeetingAlert('timeUp');
  }, [totalRemainingSeconds]);

  const alertedEventIdRef = useRef(null);
  useEffect(() => {
    if (offtopicEventId == null) return;
    if (alertedEventIdRef.current === offtopicEventId) return;
    alertedEventIdRef.current = offtopicEventId;
    playMeetingAlert('offtopic');
  }, [offtopicEventId]);
};

import { useEffect, useRef } from 'react';

export const useAutoPauseOnMicDenied = ({
  isHost,
  micState,
  timer,
  pause,
  resume,
}) => {
  const isDenied = micState === 'DENIED';
  const wasDeniedRef = useRef(false);
  const pausedByMicRef = useRef(false);

  useEffect(() => {
    if (!isHost) return;

    const wasDenied = wasDeniedRef.current;
    wasDeniedRef.current = isDenied;

    // 권한 없어짐
    if (isDenied && !wasDenied && timer.status === 'IN_PROGRESS') {
      pausedByMicRef.current = true;
      pause(timer);
      return;
    }

    // 권한 없는 채로 진행자가 직접 재개
    if (pausedByMicRef.current && timer.status === 'IN_PROGRESS') {
      pausedByMicRef.current = false;
    }

    // 권한을 다시 허용함
    if (!isDenied && wasDenied && pausedByMicRef.current) {
      pausedByMicRef.current = false;
      if (timer.status === 'PAUSED') resume(timer);
    }
  }, [isHost, isDenied, timer, pause, resume]);
};

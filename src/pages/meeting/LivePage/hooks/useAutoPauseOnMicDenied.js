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
  const prevStatusRef = useRef(null);
  const pausedByMicRef = useRef(false);

  useEffect(() => {
    if (!isHost) return;

    const wasDenied = wasDeniedRef.current;
    const prevStatus = prevStatusRef.current;
    wasDeniedRef.current = isDenied;
    prevStatusRef.current = timer.status;

    // 대기 중이던 회의가 시작
    const justStarted =
      prevStatus === 'WAITING' && timer.status === 'IN_PROGRESS';

    // 권한 없어짐, 또는 권한이 없는 채로 회의가 시작
    if (
      isDenied &&
      timer.status === 'IN_PROGRESS' &&
      (!wasDenied || justStarted)
    ) {
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

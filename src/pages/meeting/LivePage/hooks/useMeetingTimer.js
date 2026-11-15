import { useEffect, useState } from 'react';

const TICK_MS = 500;

// 서버는 스냅샷만 보내고 30초마다 timer.sync로 보정
// status가 IN_PROGRESS일 때만 스냅샷 이후 흐른 시간을 더함
// 스냅샷을 받은 시각(receivedAt) 이후 흐른 시간을 사용
export const useMeetingTimer = (snapshot) => {
  const isRunning = snapshot.status === 'IN_PROGRESS';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [isRunning]);

  const passedSeconds = isRunning
    ? Math.max(0, Math.floor((now - snapshot.receivedAt) / 1000))
    : 0;

  const totalElapsedSeconds = snapshot.totalElapsedSeconds + passedSeconds;
  const agendaElapsedSeconds = snapshot.agendaElapsedSeconds + passedSeconds;

  return {
    status: snapshot.status,
    currentAgendaId: snapshot.currentAgendaId,
    plannedTotalSeconds: snapshot.plannedTotalSeconds,
    totalElapsedSeconds,
    totalRemainingSeconds: snapshot.plannedTotalSeconds - totalElapsedSeconds,
    agendaAllocatedSeconds: snapshot.agendaAllocatedSeconds,
    agendaElapsedSeconds,
    agendaRemainingSeconds:
      snapshot.agendaAllocatedSeconds - agendaElapsedSeconds,
  };
};

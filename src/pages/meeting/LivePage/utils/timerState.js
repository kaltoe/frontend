export const WARNING_SECONDS = 60;

// 남은 시간에 따른 타이머 상태
// - 'normal': 정상 진행
// - 'warning': 1분 이하 남음
// - 'over': 시간 초과
export const getTimerState = (remainingSeconds) => {
  if (remainingSeconds < 0) return 'over';
  if (remainingSeconds <= WARNING_SECONDS) return 'warning';
  return 'normal';
};

// 끝난 안건이 배정 시간을 넘겼는지
// actualSeconds: API-04 agendas[].actualSeconds, API-07·agenda.changed previousAgenda.actualSeconds
export const isOvertimeAgenda = (agenda) =>
  agenda.actualSeconds !== null &&
  agenda.actualSeconds > agenda.allocatedSeconds;

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

// 끝난 안건 판정의 허용 범위 (API-07 outcome: ±60초 안이면 ON_TIME)
export const OVERTIME_TOLERANCE_SECONDS = 60;

// diffSeconds = actualSeconds − allocatedSeconds 가 +60초 넘으면 초과
// API-04 안건에는 outcome이 없어서 같은 계산을 화면에서 함
export const isOvertimeAgenda = (agenda) =>
  agenda.actualSeconds !== null &&
  agenda.actualSeconds - agenda.allocatedSeconds > OVERTIME_TOLERANCE_SECONDS;

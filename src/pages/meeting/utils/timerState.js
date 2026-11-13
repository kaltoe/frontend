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

const STATE_LEVEL = { normal: 0, warning: 1, over: 2 };

// 두 상태 중 더 급한 쪽 (over > warning > normal)
export const getUrgentState = (a, b) =>
  STATE_LEVEL[a] >= STATE_LEVEL[b] ? a : b;

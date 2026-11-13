// 초 → 'mm:ss' 형식. 음수면 초과 시간으로 보고 '-mm:ss'
// 예) 1769 → '29:29', -1 → '-00:01', 5400 → '90:00'
export const formatTimer = (seconds) => {
  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(seconds);
  const mm = String(Math.floor(abs / 60)).padStart(2, '0');
  const ss = String(abs % 60).padStart(2, '0');
  return `${sign}${mm}:${ss}`;
};

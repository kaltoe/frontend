const pad = (number) => String(number).padStart(2, '0');

const toClockTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// 2026. 11. 08.
export const formatDate = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}.`;
};

// 2026. 11. 08. 14:00 시작 - 14:28 종료
export const formatMeetingPeriod = (startedAt, endedAt) => {
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  return `${formatDate(start)} ${toClockTime(start)} 시작 - ${toClockTime(end)} 종료`;
};

// 초를 분:초(예: 28:00)로 바꾼다.
export const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
};

// 입력값에서 회의 코드를 꺼낸다.
// 코드만 입력하면 그대로, 링크 전체를 붙여넣으면 마지막 경로 조각을 코드로 본다.
// TODO: 공유 링크 형식이 확정되면 규칙을 맞춘다 (이슈 #6 확인 필요 항목)
export const extractMeetingCode = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const withoutQuery = trimmed.split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';

  return last.toUpperCase();
};

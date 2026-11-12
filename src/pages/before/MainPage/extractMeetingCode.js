// 회의 코드 형식: 헷갈리는 글자(I, O, 0, 1)를 뺀 대문자·숫자 6자 (API 명세서 공통 규약)
const MEETING_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

// 입력값에서 회의 코드를 꺼낸다. 형식에 맞지 않으면 빈 문자열을 돌려준다.
// 코드만 입력하면 그대로, 초대 링크 전체를 붙여넣으면 마지막 경로 조각을 코드로 본다.
// 대문자로 바꿔 보내는 것까지가 API-01의 규칙이다.
export const extractMeetingCode = (value) => {
  const withoutQuery = value.trim().split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  const code = (segments[segments.length - 1] ?? '').toUpperCase();

  return MEETING_CODE_PATTERN.test(code) ? code : '';
};

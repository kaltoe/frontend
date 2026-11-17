// 회의 종료 후 이 기간이 지나면 회의 내용 탭을 결제 안내 창으로 가린다. (기능명세서 #49)
// 서버는 참가자 결과 화면에 기간 검사를 하지 않아(API-14 기간 없음, API-13 보관 14일) 화면에서 판단한다.
// 공유 링크는 서버가 종료 후 7일에 만료시키므로 공유 화면에는 쓰지 않는다.
export const SCRIPT_LOCK_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export const isScriptLockPassed = (endedAt, now) =>
  now >= new Date(endedAt).getTime() + SCRIPT_LOCK_DAYS * DAY_MS;

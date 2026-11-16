// 회의 입장 정보를 회의 코드별로 localStorage에 저장 (API-01 비고)
// - accessToken: API-02·API-03 응답. 새로고침·재접속 때 Sign In 없이 바로 입장
// - hostRecoveryKey: API-02 응답에서만 한 번 받음 → 초대 모달(#22)에 보여줌
// 저장소가 막힌 브라우저(사생활 보호 모드 등)은 넘어감

const STORAGE_PREFIX = 'kaltoe:meeting:';

const getStorageKey = (meetingId) => `${STORAGE_PREFIX}${meetingId}`;

export const getMeetingSession = (meetingId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(meetingId));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 기존 값에 덧붙여 저장 (예: 참여자는 accessToken만)
export const saveMeetingSession = (meetingId, values) => {
  try {
    const next = { ...getMeetingSession(meetingId), ...values };
    localStorage.setItem(getStorageKey(meetingId), JSON.stringify(next));
  } catch {
    // 저장 실패는 무시 (다음 입장 때 다시 Sign In)
  }
};

// 토큰이 만료(401)됐을 때 등
export const clearMeetingSession = (meetingId) => {
  try {
    localStorage.removeItem(getStorageKey(meetingId));
  } catch {
    // 무시
  }
};

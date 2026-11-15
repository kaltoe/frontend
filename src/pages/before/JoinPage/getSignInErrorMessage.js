// API-03 실패 응답을 하단 안내 문구로 바꾼다
const ERROR_MESSAGES = {
  NAME_TAKEN: '이미 참여 중인 이름이에요.',
  INVALID_PASSWORD: '비밀번호가 맞지 않아요.',
  INVALID_RECOVERY_KEY: '진행자 복구 키가 맞지 않아요.',
  TOO_MANY_ATTEMPTS: '여러 번 틀려서 5분 뒤에 다시 시도할 수 있어요.',
  TOO_MANY_REQUESTS: '잠시 후 다시 시도해주세요.',
  MEETING_NOT_FOUND: '존재하지 않는 회의예요.',
  MEETING_EXPIRED: '만료된 회의 코드예요.',
  MEETING_ENDED: '이미 끝난 회의예요.',
};

export const getSignInErrorMessage = (error) => {
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? '서버 응답이 늦어요. 잠시 후 다시 시도해주세요.'
      : '네트워크 연결을 확인해주세요.';
  }

  const { code, message } = error.response.data?.error ?? {};
  if (code === 'VALIDATION_ERROR' && message) return message;
  return ERROR_MESSAGES[code] ?? '회의에 들어가지 못했어요. 다시 시도해주세요.';
};

// API-02 실패 응답을 하단 안내 문구로 바꾼다
const ERROR_MESSAGES = {
  AGENDA_TIME_MISMATCH: '안건 시간 합계가 목표 시간과 달라요.',
  CONSENT_REQUIRED: '음성 수집 및 AI 분석에 동의해주세요.',
  VALIDATION_ERROR: '입력한 내용을 다시 확인해주세요.',
};

export const getCreateMeetingErrorMessage = (error) => {
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? '서버 응답이 늦어요. 잠시 후 다시 시도해주세요.'
      : '네트워크 연결을 확인해주세요.';
  }

  const { code, message } = error.response.data?.error ?? {};
  if (code === 'VALIDATION_ERROR' && message) return message;
  if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (error.response.status === 429) {
    return '요청이 너무 많아요. 잠시 후 다시 시도해주세요.';
  }
  return '회의를 만들지 못했어요. 다시 시도해주세요.';
};

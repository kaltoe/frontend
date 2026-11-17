import { api } from './instance';

// API-01 회의 입장 정보 조회 (토큰 없이 호출)
// 응답: { meetingId, title, status, connectedCount, expiresAt }
// 없는 회의 404, 끝났거나 만료된 회의 410
export const getEntryInfo = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/entry`);
  return response.data.data;
};

// API-02 회의 생성 (토큰 없이 호출)
// 만들면 대기(WAITING) 상태. 진행자가 [회의 시작](API-19)을 눌러야 타이머가 돈다
// idempotencyKey: 셋업 화면에 들어올 때 만든 UUID. 10분 안에 같은 키로 다시 보내면 처음 응답을 그대로 받음
export const createMeeting = async (payload, idempotencyKey) => {
  const response = await api.post('/meetings', payload, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
  return response.data.data;
};

// API-03 참여 Sign In (토큰 없이 호출)
// body: { name, password? } 또는 진행자 복구 시 { hostRecoveryKey }
export const signIn = async (meetingId, body) => {
  const response = await api.post(`/meetings/${meetingId}/sign-in`, body);
  return response.data.data;
};

// API-04 회의 현재 상태 조회
export const getMeetingState = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/state`, {
    meetingId,
  });
  return response.data.data;
};

// API-05 일시 정지 (진행자만)
export const pauseMeeting = async (meetingId) => {
  const response = await api.post(`/meetings/${meetingId}/pause`, null, {
    meetingId,
  });
  return response.data.data;
};

// API-06 회의 재개 (진행자만)
export const resumeMeeting = async (meetingId) => {
  const response = await api.post(`/meetings/${meetingId}/resume`, null, {
    meetingId,
  });
  return response.data.data;
};

// API-07 다음 안건으로 전환 (진행자만)
export const nextAgenda = async (meetingId, fromAgendaId) => {
  const response = await api.post(
    `/meetings/${meetingId}/agendas/next`,
    { fromAgendaId },
    { meetingId },
  );
  return response.data.data;
};

// API-19 회의 시작 (진행자만)
export const startMeeting = async (meetingId) => {
  const response = await api.post(`/meetings/${meetingId}/start`, null, {
    meetingId,
  });
  return response.data.data;
};

// API-08 회의 종료 (진행자만)
export const endMeeting = async (meetingId) => {
  const response = await api.post(`/meetings/${meetingId}/end`, null, {
    meetingId,
  });
  return response.data.data;
};

// API-09 사담 경고 닫기
// 응답: { eventId, dismissedAt }. 전원에게 offtopic.dismissed가 감
// 이미 닫힌 경고면 다시 보내도 200, 없는 경고(다른 회의 등)는 404
export const dismissOfftopicEvent = async (meetingId, eventId) => {
  const response = await api.post(
    `/meetings/${meetingId}/offtopic-events/${eventId}/dismiss`,
    null,
    { meetingId },
  );
  return response.data.data;
};

// API-10 회의 결과 조회
// 끝낸 안건만 오고, 소요 시간을 계산하지 못하면(UNKNOWN) 시간 값이 모두 null
// 토큰이 없거나 만료되면 401, 끝나지 않은 회의는 409
export const getMeetingResult = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/result`, {
    meetingId,
  });
  return response.data.data;
};

// API-11 요약 조회
// 응답: { status: PROCESSING | DONE | FAILED, agendas: [{ agendaId, lines }] }
// 항상 200 (AI 실패도 status: FAILED). PROCESSING이면 3초마다 다시 부른다
// DONE이면 끝낸 안건이 순서대로 오고, 발언이 없던 안건은 lines: []
export const getSummary = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/summary`, {
    meetingId,
  });
  return response.data.data;
};

// API-12 요약 다시 생성
// FAILED일 때만 202 { status: PROCESSING }. 아니면(이미 만드는 중 등) 409 INVALID_STATE
export const retrySummary = async (meetingId) => {
  const response = await api.post(
    `/meetings/${meetingId}/summary/retry`,
    null,
    {
      meetingId,
    },
  );
  return response.data.data;
};

// API-13 녹음 조회
// 응답: { status: PROCESSING | READY | FAILED, url, urlExpiresAt, durationMs, mimeType }
// READY면 url(1시간짜리 주소)을 audio src에 쓴다. PROCESSING이면 url이 null이라 3초마다 다시 부른다
// 보관 기간이 지나면 410 RECORDING_EXPIRED
export const getRecording = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/recording`, {
    meetingId,
  });
  return response.data.data;
};

// API-14 전체 기록 조회
// 응답: { source, groups: [{ agendaId, orderIndex, title, items: [{ utteranceId, speakerLabel, text, offsetMs }] }] }
// source AUTO(기본): 녹음 후처리가 끝났으면 POSTPROCESS(화자 N), 아니면 REALTIME
// 발화가 없는 안건은 빠진다
export const getTranscripts = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/transcripts`, {
    meetingId,
  });
  return response.data.data;
};

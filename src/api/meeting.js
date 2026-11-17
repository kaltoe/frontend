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

// API-10 회의 결과 조회
// 끝낸 안건만 오고, 소요 시간을 계산하지 못하면(UNKNOWN) 시간 값이 모두 null
// 토큰이 없거나 만료되면 401, 끝나지 않은 회의는 409
export const getMeetingResult = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/result`, {
    meetingId,
  });
  return response.data.data;
};

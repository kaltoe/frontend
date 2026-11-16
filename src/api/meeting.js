import { api } from './instance';

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

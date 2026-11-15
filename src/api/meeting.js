import { api } from './instance';

// API-02 회의 생성 = 시작 (토큰 없이 호출)
// idempotencyKey: 셋업 화면에 들어올 때 만든 UUID. 10분 안에 같은 키로 다시 보내면 처음 응답을 그대로 받음
export const createMeeting = async (payload, idempotencyKey) => {
  const response = await api.post('/meetings', payload, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
  return response.data.data;
};

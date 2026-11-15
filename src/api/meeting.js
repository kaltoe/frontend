import { api } from './instance';

// API-04 회의 현재 상태 조회
export const getMeetingState = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/state`, {
    meetingId,
  });
  return response.data.data;
};

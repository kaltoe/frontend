import axios from 'axios';
import { clearMeetingSession, getMeetingSession } from '@/utils/meetingSession';

// REST API 서버 (VITE_API_URL. WebSocket 서버 주소는 VITE_WS_URL)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
  timeout: 10000,
});

// 요청마다 회의 코드를 넘기면 그 회의의 토큰을 붙임
// 예: api.get(`/meetings/${id}`, { meetingId: id })
api.interceptors.request.use((config) => {
  const accessToken = config.meetingId
    ? getMeetingSession(config.meetingId)?.accessToken
    : null;

  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  else delete config.headers.Authorization;

  return config;
});

// 토큰 만료 → 저장된 토큰을 지워서 다음 입장 때 다시 Sign In
// 어느 화면으로 보낼지는 화면마다 달라서 호출한 쪽에서 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    if (
      response?.status === 401 &&
      response.data?.error?.code === 'UNAUTHORIZED' &&
      config?.meetingId
    ) {
      clearMeetingSession(config.meetingId);
    }
    return Promise.reject(error);
  },
);

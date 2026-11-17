import { api } from './instance';

// 공유 화면(/s/:shareId) API. 링크를 받은 사람이 토큰 없이 shareId로 부른다.
// 없는 링크는 404 SHARE_NOT_FOUND, 만료된 링크(회의 종료 + 7일)는 410 SHARE_EXPIRED

// API-16 공유 회의록 조회
// 응답: { title, participantCount, startedAt, endedAt, time, agendas: [{ agendaId, orderIndex, title, allocatedSeconds, actualSeconds, diffSeconds, outcome, offtopicCount, summaryLines }], summaryStatus, expiresAt }
// summaryLines는 항상 배열. 요약이 DONE이 아니거나 발언이 없던 안건이면 []
export const getSharedMeeting = async (shareId) => {
  const response = await api.get(`/shares/${shareId}`);
  return response.data.data;
};

// API-17 공유 전체 기록 조회
// 응답: API-14와 같고 utteranceId만 없다. { source, groups: [{ agendaId, orderIndex, title, items: [{ speakerLabel, text, offsetMs }] }] }
export const getSharedTranscripts = async (shareId) => {
  const response = await api.get(`/shares/${shareId}/transcripts`);
  return response.data.data;
};

// API-18 공유 녹음 조회
// 응답: API-13과 같다. { status, url, urlExpiresAt, durationMs, mimeType }
// 녹음 보관 기간(종료 + 14일)이 지나면 링크가 살아 있어도 410 RECORDING_EXPIRED
export const getSharedRecording = async (shareId) => {
  const response = await api.get(`/shares/${shareId}/recording`);
  return response.data.data;
};

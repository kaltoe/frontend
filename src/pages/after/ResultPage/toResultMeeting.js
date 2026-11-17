import { mockResult } from './mockResult';

// API-10 응답을 결과 화면에서 쓰는 모양으로 바꾼다.
// 공유 화면의 만료 날짜는 아직 연동 전이라 임시 데이터를 붙인다.
// TODO: API-16 연동 후 공유 화면 응답의 expiresAt으로 교체
export const toResultMeeting = (result) => ({
  shareExpiresAt: mockResult.shareExpiresAt,
  title: result.title,
  participantCount: result.participantCount,
  startedAt: result.startedAt,
  endedAt: result.endedAt,
  time: result.time,
  agendas: result.agendas.map((agenda) => ({
    id: agenda.agendaId,
    title: agenda.title,
    allocatedSeconds: agenda.allocatedSeconds,
    actualSeconds: agenda.actualSeconds,
    diffSeconds: agenda.diffSeconds,
    outcome: agenda.outcome,
    offtopicCount: agenda.offtopicCount,
    // 회의 내용 탭에서 안건을 누르면 옮길 녹음 위치(초)
    startSeconds:
      agenda.recordingStartMs == null ? null : agenda.recordingStartMs / 1000,
  })),
});

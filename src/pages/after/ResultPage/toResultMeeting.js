// API-10 회의 결과(또는 API-16 공유 회의록) 응답을 결과 화면에서 쓰는 모양으로 바꾼다.
export const toResultMeeting = (result) => ({
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
    // 공유 회의록(API-16)에는 없어 첫 발화 위치로 옮긴다.
    startSeconds:
      agenda.recordingStartMs == null ? null : agenda.recordingStartMs / 1000,
  })),
});

// API-16 공유 회의록 응답. 결과에 공유 기한과 요약을 함께 붙인다.
export const toSharedMeeting = (shared) => ({
  ...toResultMeeting(shared),
  shareExpiresAt: shared.expiresAt,
  summary: {
    status: shared.summaryStatus,
    linesById: Object.fromEntries(
      shared.agendas.map((agenda) => [agenda.agendaId, agenda.summaryLines]),
    ),
  },
});

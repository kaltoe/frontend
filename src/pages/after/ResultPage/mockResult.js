// 개발 중 VITE_USE_MOCK=true일 때 서버 없이 보는 임시 데이터
// - 결과 탭 값: API-10 응답 모양
// - summary: API-11, utterances: API-14, audioUrl·recordingSeconds: API-13, shareId: API-15, shareExpiresAt: API-16
const createUtterances = (agendaId, startSeconds) =>
  [0, 15, 40, 70].map((offset, index) => ({
    id: `${agendaId}-${index}`,
    startSeconds: startSeconds + offset,
    speaker: `화자 ${(index % 3) + 1}`,
    text: '발화내용발화내용발화내용발화내용발화내용발화내용발화내용발화내용발화내용발화내용발화내용',
  }));

export const mockResult = {
  title: '회의 제목 회의 제목 회의 제목',
  participantCount: 3,
  startedAt: '2026-11-08T14:00:00+09:00',
  endedAt: '2026-11-08T14:28:00+09:00',
  time: {
    plannedTotalSeconds: 1800,
    actualDurationSeconds: 1680,
    pausedTotalSeconds: 0,
    diffSeconds: -120,
    outcome: 'SAVED',
  },
  agendas: [
    {
      agendaId: 1,
      title: '안건 1제목',
      allocatedSeconds: 600,
      actualSeconds: 720,
      diffSeconds: 120,
      outcome: 'OVERTIME',
      offtopicCount: 2,
    },
    {
      agendaId: 2,
      title: '안건 2제목',
      allocatedSeconds: 600,
      actualSeconds: 540,
      diffSeconds: -60,
      outcome: 'ON_TIME',
      offtopicCount: 0,
    },
    {
      agendaId: 3,
      title: '안건 3제목',
      allocatedSeconds: 600,
      actualSeconds: 420,
      diffSeconds: -180,
      outcome: 'SAVED',
      offtopicCount: 1,
    },
  ],

  audioUrl: null,
  recordingSeconds: 1680,
  shareId: 'mock-share-id',
  shareExpiresAt: '2026-11-15T00:00:00+09:00',
  agendaDetails: [
    {
      summary: ['요약 내용', '요약 내용', '요약 내용'],
      utterances: createUtterances(1, 12),
    },
    {
      // 발언이 없던 안건 예시
      summary: [],
      utterances: createUtterances(2, 720),
    },
    {
      summary: ['요약 내용', '요약 내용', '요약 내용'],
      utterances: createUtterances(3, 1260),
    },
  ],
};

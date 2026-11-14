// TODO: 회의 결과 API 연동 후 삭제
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
  startedAt: '2026-11-08T14:00:00',
  endedAt: '2026-11-08T14:28:00',
  summaryStatus: 'done',
  agendas: [
    {
      id: 1,
      title: '안건 1제목',
      plannedMinutes: 10,
      actualSeconds: 720,
      chatterCount: 2,
      summary: ['요약 내용', '요약 내용', '요약 내용'],
      utterances: createUtterances(1, 12),
    },
    {
      id: 2,
      title: '안건 2제목',
      plannedMinutes: 10,
      actualSeconds: 540,
      chatterCount: 0,
      summary: ['요약 내용', '요약 내용', '요약 내용'],
      utterances: createUtterances(2, 720),
    },
    {
      id: 3,
      title: '안건 3제목',
      plannedMinutes: 10,
      actualSeconds: 420,
      chatterCount: 1,
      summary: ['요약 내용', '요약 내용', '요약 내용'],
      utterances: createUtterances(3, 1260),
    },
  ],
};

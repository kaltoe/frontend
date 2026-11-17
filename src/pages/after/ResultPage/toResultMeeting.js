import { mockResult } from './mockResult';

// API-10 응답을 결과 화면에서 쓰는 모양으로 바꾼다.
// 회의 내용·녹음·공유 값은 아직 연동 전이라 임시 데이터를 안건 순서대로 붙인다.
// TODO: API-13·14·15 연동 후 임시 데이터 대신 각 응답으로 교체
export const toResultMeeting = (result) => {
  const { agendaDetails, ...mockValues } = mockResult;

  return {
    ...mockValues,
    title: result.title,
    participantCount: result.participantCount,
    startedAt: result.startedAt,
    endedAt: result.endedAt,
    time: result.time,
    agendas: result.agendas.map((agenda, index) => ({
      id: agenda.agendaId,
      title: agenda.title,
      allocatedSeconds: agenda.allocatedSeconds,
      actualSeconds: agenda.actualSeconds,
      diffSeconds: agenda.diffSeconds,
      outcome: agenda.outcome,
      offtopicCount: agenda.offtopicCount,
      utterances: agendaDetails[index]?.utterances ?? [],
    })),
  };
};

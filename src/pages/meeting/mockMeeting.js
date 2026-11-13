// role: 'HOST' | 'PARTICIPANT'
// mode: 'OFFLINE' | 'ONLINE'
export const mockMeeting = {
  meetingId: 'K7Q2MX',
  title: '회의 제목',
  role: 'HOST',
  mode: 'OFFLINE',
  participantCount: 3,

  // diffSeconds: 끝난 안건의 실제 소요 − 배정 초 (양수면 초과, 아직 안 끝났으면 null)
  agendas: [
    {
      id: 12,
      title: '안건 제목',
      keywords: ['키워드'],
      allocatedMinutes: 10,
      diffSeconds: null,
    },
    {
      id: 13,
      title: '안건안건안건',
      keywords: [],
      allocatedMinutes: 10,
      diffSeconds: null,
    },
    {
      id: 14,
      title: '마지막 안건',
      keywords: [],
      allocatedMinutes: 10,
      diffSeconds: null,
    },
  ],

  //   진행 바: currentAgendaId, agendaElapsedSeconds
  //   숫자: totalElapsedSeconds
  //   예) 안건 3개(10분씩), 초과 없이 29분 50초 지남
  //       → totalElapsedSeconds: 1790, currentAgendaId: 14, agendaElapsedSeconds: 590
  timer: {
    serverNow: '2026-11-03T14:00:31+09:00',
    status: 'IN_PROGRESS', // 'IN_PROGRESS' | 'PAUSED' | 'ENDED'
    plannedTotalSeconds: 1800, // 전체 목표 시간
    totalElapsedSeconds: 31, // 전체에서 지난 시간
    pausedTotalSeconds: 0, // 누적 정지
    currentAgendaId: 12, // 안건 id
    agendaAllocatedSeconds: 600, // 안건 배정 시간
    agendaElapsedSeconds: 31, // 안건 지난 시간

    receivedAt: Date.now(),
  },
};

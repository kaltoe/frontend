export const mockMeeting = {
  meetingId: 'K7Q2MX',
  title: '회의 제목',
  status: 'IN_PROGRESS', // 'IN_PROGRESS' | 'PAUSED' | 'ENDED'
  connectedCount: 3, // 지금 접속 중인 인원

  // TODO: API-04 응답에 meetingMode가 없음. 참여자도 받을 수 있게 추가 요청 필요(확인 필요)
  meetingMode: 'IN_PERSON', // 'IN_PERSON'(대면) | 'REMOTE'(비대면)

  // status: 'PENDING'(대기) | 'IN_PROGRESS'(진행 중) | 'DONE'(끝남)
  agendas: [
    {
      agendaId: 12,
      orderIndex: 0,
      title: '안건 제목',
      keywords: ['키워드', '키워드', '키워드', '키워드', '키워드'],
      allocatedSeconds: 600,
      status: 'IN_PROGRESS',
      actualSeconds: null,
    },
    {
      agendaId: 13,
      orderIndex: 1,
      title: '안건안건안건',
      keywords: [],
      allocatedSeconds: 600,
      status: 'PENDING',
      actualSeconds: null,
    },
    {
      agendaId: 14,
      orderIndex: 2,
      title: '마지막 안건',
      keywords: [],
      allocatedSeconds: 600,
      status: 'PENDING',
      actualSeconds: null,
    },
  ],

  //   totalElapsedSeconds = 끝난 안건들의 actualSeconds 합 + agendaElapsedSeconds
  //   예) 안건 3개(10분씩), 초과 없이 29분 50초 지남
  //       → totalElapsedSeconds: 1790, currentAgendaId: 14, agendaElapsedSeconds: 590
  timer: {
    serverNow: '2026-11-03T14:00:31+09:00',
    status: 'IN_PROGRESS', // 'IN_PROGRESS' | 'PAUSED' | 'ENDED'
    plannedTotalSeconds: 1800, // 전체 목표 시간
    totalElapsedSeconds: 31, // 전체에서 지난 시간
    pausedTotalSeconds: 0, // 누적 정지
    currentAgendaId: 12, // 진행 중 안건 id
    agendaAllocatedSeconds: 600, // 진행 중 안건 배정 시간
    agendaElapsedSeconds: 31, // 진행 중 안건 지난 시간

    // 스냅샷을 받은 시각(브라우저 기준). 실제로는 API 응답·WebSocket 수신 시점에 기록
    receivedAt: Date.now(),
  },

  me: {
    participantId: 1,
    name: '진행자',
    role: 'HOST', // 'HOST' | 'MEMBER'
    micState: 'ON', // 'ON' | 'OFF' | 'DENIED'
  },
};

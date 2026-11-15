// 셋업 화면 입력값을 API-02 요청 body로 바꾼다
const MEETING_MODES = {
  offline: 'IN_PERSON',
  online: 'REMOTE',
};

export const toCreateMeetingPayload = ({
  title,
  meetingType,
  participants,
  targetTime,
  agreed,
  agendas,
}) => ({
  title: title.trim(),
  targetTotalMinutes: targetTime ?? null,
  meetingMode: MEETING_MODES[meetingType] ?? MEETING_MODES.offline,
  attendeeCount: participants ? Number(participants) : null,
  consentAgreed: agreed,
  agendas: agendas.map((agenda) => ({
    title: agenda.name.trim(),
    keywords: [
      ...new Set(agenda.keywords.map((keyword) => keyword.trim())),
    ].filter(Boolean),
    allocatedMinutes: Number(agenda.minutes),
  })),
});

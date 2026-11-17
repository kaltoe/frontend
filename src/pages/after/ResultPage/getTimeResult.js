// 계획보다 길면 양수(초과), 짧으면 음수(단축)인 분 단위 차이
// 판정은 서버(±60초 허용)를 따르고, 정확 준수(ON_TIME)면 0이다.
const toDiffMinutes = (diffSeconds, outcome) =>
  outcome === 'ON_TIME' ? 0 : Math.round(diffSeconds / 60);

export const formatDiff = (diffMinutes) => {
  if (diffMinutes === 0) return null;
  return `${Math.abs(diffMinutes)}분 ${diffMinutes > 0 ? '초과' : '단축'}`;
};

// API-10 시간 값으로 시간 링·안건 목록에 쓸 값을 만든다.
// 서버가 소요 시간을 계산하지 못하면(UNKNOWN) 시간 값이 모두 null이라 null을 돌려준다.
export const getTimeResult = ({ time, agendas }) => {
  if (time.outcome === 'UNKNOWN' || time.actualDurationSeconds === null) {
    return null;
  }

  return {
    plannedSeconds: time.plannedTotalSeconds,
    actualSeconds: time.actualDurationSeconds,
    diffMinutes: toDiffMinutes(time.diffSeconds, time.outcome),
    agendas: agendas.map((agenda) => ({
      id: agenda.id,
      actualSeconds: agenda.actualSeconds,
      diffMinutes: toDiffMinutes(agenda.diffSeconds, agenda.outcome),
    })),
  };
};

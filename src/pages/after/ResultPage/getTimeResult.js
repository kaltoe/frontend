// 실제 시간이 계획보다 길면 양수(초과), 짧으면 음수(단축)인 분 단위 차이
const getDiffMinutes = (actualSeconds, plannedSeconds) =>
  Math.round((actualSeconds - plannedSeconds) / 60);

export const formatDiff = (diffMinutes) => {
  if (diffMinutes === 0) return null;
  return `${Math.abs(diffMinutes)}분 ${diffMinutes > 0 ? '초과' : '단축'}`;
};

// 안건별 실제 시간이 하나라도 없으면 소요 시간을 계산할 수 없다.
export const getTimeResult = (agendas) => {
  const isComputable = agendas.every(
    (agenda) => typeof agenda.actualSeconds === 'number',
  );
  if (!isComputable) return null;

  const plannedSeconds = agendas.reduce(
    (total, agenda) => total + agenda.plannedMinutes * 60,
    0,
  );
  const actualSeconds = agendas.reduce(
    (total, agenda) => total + agenda.actualSeconds,
    0,
  );

  return {
    plannedSeconds,
    actualSeconds,
    diffMinutes: getDiffMinutes(actualSeconds, plannedSeconds),
    agendas: agendas.map((agenda) => ({
      id: agenda.id,
      actualSeconds: agenda.actualSeconds,
      diffMinutes: getDiffMinutes(
        agenda.actualSeconds,
        agenda.plannedMinutes * 60,
      ),
    })),
  };
};

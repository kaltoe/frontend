// 전체 목표 시간을 안건 수만큼 나눠 각 안건 시간으로 넣는다 (분 단위)
// 나누어떨어지지 않으면 남는 1분씩을 앞 안건부터 더한다
// 예) 30분, 안건 4개 → 8, 8, 7, 7
// 목표 시간을 정하지 않았으면(null) 그대로 둔다
export const distributeAgendaMinutes = (agendas, targetTime) => {
  if (targetTime === null || agendas.length === 0) return agendas;

  const baseMinutes = Math.floor(targetTime / agendas.length);
  const remainder = targetTime % agendas.length;

  return agendas.map((agenda, index) => ({
    ...agenda,
    minutes: String(baseMinutes + (index < remainder ? 1 : 0)),
  }));
};

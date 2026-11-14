// 복사용 요약 글. 안건마다 번호와 제목 아래에 요약 세 줄을 붙인다.
export const getSummaryText = (agendas) =>
  agendas
    .map((agenda, index) =>
      [`${index + 1}. ${agenda.title}`, ...agenda.summary].join('\n'),
    )
    .join('\n\n');

import { NO_SPEECH_SUMMARY } from './constants';

// 복사용 요약 글. 안건마다 번호와 제목 아래에 요약 세 줄을 붙인다.
// 발언이 없던 안건은 요약 대신 안내 문구를 붙인다.
export const getSummaryText = (agendas) =>
  agendas
    .map((agenda, index) =>
      [
        `${index + 1}. ${agenda.title}`,
        ...(agenda.summary.length > 0 ? agenda.summary : [NO_SPEECH_SUMMARY]),
      ].join('\n'),
    )
    .join('\n\n');

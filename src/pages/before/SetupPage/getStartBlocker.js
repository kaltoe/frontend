import { TITLE_MAX_LENGTH, TITLE_MIN_LENGTH } from './constants';

export const getAgendaTotalMinutes = (agendas) =>
  agendas.reduce((total, agenda) => total + Number(agenda.minutes || 0), 0);

// 회의를 시작할 수 없는 첫 번째 이유를 돌려준다. 시작할 수 있으면 null
export const getStartBlocker = ({ title, agendas, targetTime, agreed }) => {
  if (
    title.trim().length < TITLE_MIN_LENGTH ||
    title.length > TITLE_MAX_LENGTH
  ) {
    return { message: `회의 제목을 ${TITLE_MIN_LENGTH}자 이상 입력해주세요.` };
  }
  if (agendas.length === 0) {
    return { message: '안건을 1개 이상 등록해주세요.' };
  }
  if (targetTime !== null && getAgendaTotalMinutes(agendas) !== targetTime) {
    return { message: '안건 시간 합계가 목표 시간과 달라요.', type: 'danger' };
  }
  if (!agreed) {
    return { message: '음성 수집 및 AI 분석에 동의해주세요.' };
  }
  return null;
};

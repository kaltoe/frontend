// 실시간 자막 상태 (기능명세서 #29, #31)
// - 'stopped': 내 마이크 OFF → "자막 중단" 배지
// - 'noAudio': 마이크 권한 없음 또는 음성 미감지 → "음성 미감지" 배지
// - 'delayed': 자막 변환 지연
// - 'ok': 정상
export const getCaptionStatus = ({ micState, sttStatus }) => {
  if (micState === 'OFF') return 'stopped';
  if (micState === 'DENIED' || sttStatus === 'NO_AUDIO') return 'noAudio';
  if (sttStatus === 'DELAYED') return 'delayed';
  return 'ok';
};

// 자막이 하나도 없을 때 문구
export const getEmptyCaptionText = (status) =>
  status === 'noAudio'
    ? '등록된 자막이 없어요.'
    : '발언을 시작하면 실시간으로 기록됩니다...';

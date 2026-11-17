export const RESULT_TABS = [
  { value: 'result', label: '회의 결과' },
  { value: 'summary', label: '3줄 요약' },
  { value: 'script', label: '회의 내용' },
];

// 발언이 없던 안건(API-11 lines: [])에 보여 줄 문구
export const NO_SPEECH_SUMMARY = '해당 안건에 대한 발언이 없습니다.';

// API-11 요약 상태
export const SUMMARY_STATUS = {
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  FAILED: 'FAILED',
};

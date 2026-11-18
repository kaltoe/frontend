// 녹음 위치를 바꾸면 currentTime이 발화 시작 시각보다 아주 조금 작게 나올 수 있어 여유를 둔다.
const SEEK_TOLERANCE_SECONDS = 0.05;

const getGroupStartSeconds = (group) =>
  group.startSeconds ?? group.utterances[0]?.startSeconds ?? 0;

// 재생 위치(초)에서 지금 재생 중인 안건과 발화를 찾는다.
// 발화에는 시작 시각만 있어서, 다음 발화가 시작되기 전까지 앞 발화를 재생 중으로 본다.
// 안건은 시작했지만 첫 발화 전이면 utterance는 null이다. 첫 안건 전이면 null을 돌려준다.
// groups: 회의 내용 탭의 안건별 발화 [{ id, startSeconds, utterances: [{ id, startSeconds }] }]
export const getPlayingScript = (groups, seconds) => {
  const isStarted = (startSeconds) =>
    startSeconds <= seconds + SEEK_TOLERANCE_SECONDS;

  const group = groups.findLast((item) =>
    isStarted(getGroupStartSeconds(item)),
  );
  if (!group) return null;

  const utterance =
    group.utterances.findLast((item) => isStarted(item.startSeconds)) ?? null;
  return { group, utterance };
};

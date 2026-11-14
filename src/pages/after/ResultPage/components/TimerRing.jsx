import { formatDuration } from '../formatResult';
import { formatDiff } from '../getTimeResult';
import styles from './TimerRing.module.scss';

const SIZE = 232;
const CENTER = SIZE / 2;
const TRACK_RADIUS = 112;
const SEGMENT_RADIUS = 110.78;
const SEGMENT_CIRCUMFERENCE = 2 * Math.PI * SEGMENT_RADIUS;
const SEGMENT_GAP = 2;

// 원 한 바퀴는 계획 시간과 실제 시간 중 긴 쪽이다.
// 안건마다 실제 시간만큼 구간을 그리고, 계획보다 길어진 안건은 빨간색으로 칠한다.
const getSegments = (timeResult) => {
  const scale = Math.max(timeResult.plannedSeconds, timeResult.actualSeconds);
  let start = 0;

  return timeResult.agendas.map((agenda) => {
    const length = (agenda.actualSeconds / scale) * SEGMENT_CIRCUMFERENCE;
    const segment = {
      id: agenda.id,
      start,
      length: Math.max(length - SEGMENT_GAP, 0),
      isOver: agenda.diffMinutes > 0,
    };
    start += length;
    return segment;
  });
};

export const TimerRing = ({ timeResult }) => {
  const isOver = timeResult?.diffMinutes > 0;
  const diffText = timeResult && formatDiff(timeResult.diffMinutes);

  return (
    <div className={styles.ring}>
      <svg
        className={styles.svg}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <circle
          className={styles.track}
          cx={CENTER}
          cy={CENTER}
          r={TRACK_RADIUS}
        />
        {timeResult &&
          getSegments(timeResult).map((segment) => (
            <circle
              key={segment.id}
              className={segment.isOver ? styles.segmentOver : styles.segment}
              cx={CENTER}
              cy={CENTER}
              r={SEGMENT_RADIUS}
              strokeDasharray={`${segment.length} ${SEGMENT_CIRCUMFERENCE}`}
              strokeDashoffset={-segment.start}
            />
          ))}
      </svg>

      {timeResult ? (
        <>
          {diffText && (
            <span
              className={`${styles.badge} ${isOver ? styles.badgeOver : ''}`}
            >
              {diffText}
            </span>
          )}
          <p className={`${styles.time} ${isOver ? styles.timeOver : ''}`}>
            {formatDuration(timeResult.actualSeconds)}
          </p>
        </>
      ) : (
        <p className={styles.unavailable}>소요 시간을 계산할 수 없어요.</p>
      )}
    </div>
  );
};

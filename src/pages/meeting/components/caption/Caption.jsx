import { meetingDotDanger, meetingDotWarning } from '@/assets';
import { formatTimer } from '@/pages/meeting/utils/formatTimer';
import styles from './Caption.module.scss';

const BADGES = {
  stopped: { label: '자막 중단', dot: meetingDotWarning },
  noAudio: { label: '음성 미감지', dot: meetingDotDanger },
  delayed: { label: '자막 지연 중', dot: meetingDotWarning },
};

// 'stopped' | 'noAudio' | 'delayed'일 때만 보임
export const CaptionBadge = ({ status }) => {
  const badge = BADGES[status];
  if (!badge) return null;

  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <img src={badge.dot} alt="" width={6} height={6} />
      {badge.label}
    </span>
  );
};

// 자막: 시간 + (비대면이면 이름) + 내용
export const CaptionLine = ({ transcript, variant = 'card' }) => (
  <li className={`${styles.line} ${styles[variant]}`}>
    <span className={styles.time}>
      {formatTimer(Math.floor(transcript.offsetMs / 1000))}
    </span>
    <p className={styles.text}>
      {transcript.speakerName && (
        <strong className={styles.speaker}>{transcript.speakerName} </strong>
      )}
      {transcript.text}
    </p>
  </li>
);

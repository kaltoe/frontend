import { pause, play } from '@/assets';
import { formatDuration } from '../formatResult';
import styles from './AudioPlayer.module.scss';

export const AudioPlayer = ({
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
}) => {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.player}>
      <button
        className={styles.playButton}
        type="button"
        onClick={onTogglePlay}
      >
        <img src={isPlaying ? pause : play} alt="" />
      </button>
      <span className={styles.time}>{formatDuration(currentTime)}</span>
      <input
        className={styles.progress}
        type="range"
        min={0}
        max={duration}
        step={1}
        value={Math.min(currentTime, duration)}
        onChange={(event) => onSeek(Number(event.target.value))}
        style={{ '--percent': `${percent}%` }}
      />
      <span className={styles.time}>{formatDuration(duration)}</span>
    </div>
  );
};

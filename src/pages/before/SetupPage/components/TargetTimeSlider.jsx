import {
  TARGET_TIME_MAX,
  TARGET_TIME_MIN,
  TARGET_TIME_SCALE,
  TARGET_TIME_STEP,
} from '../constants';
import styles from './TargetTimeSlider.module.scss';

// value가 null이면 목표 시간을 정하지 않은 상태 (안건 시간의 합을 목표 시간으로 사용)
export const TargetTimeSlider = ({ value, onChange }) => {
  const isSet = value !== null;
  const sliderValue = isSet ? value : TARGET_TIME_MIN;
  const percent =
    ((sliderValue - TARGET_TIME_MIN) / (TARGET_TIME_MAX - TARGET_TIME_MIN)) *
    100;

  return (
    <section className={styles.targetTime}>
      <div className={styles.body}>
        <div className={styles.header}>
          <label className={styles.label} htmlFor="meeting-target-time">
            전체 목표 시간
          </label>
          <div className={styles.valueRow}>
            <strong className={styles.value}>{sliderValue}분</strong>
            {isSet && (
              <button
                className={styles.resetButton}
                type="button"
                onClick={() => onChange(null)}
              >
                취소
              </button>
            )}
          </div>
        </div>

        <div className={styles.sliderArea}>
          <input
            id="meeting-target-time"
            className={`${styles.slider} ${isSet ? styles.sliderActive : ''}`}
            type="range"
            min={TARGET_TIME_MIN}
            max={TARGET_TIME_MAX}
            step={TARGET_TIME_STEP}
            value={sliderValue}
            onChange={(event) => onChange(Number(event.target.value))}
            style={{ '--percent': `${percent}%` }}
          />
          <div className={styles.scale}>
            {TARGET_TIME_SCALE.map((minute) => (
              <span key={minute}>{minute}분</span>
            ))}
          </div>
        </div>
      </div>
      <p className={styles.hint}>비워두면 안건 시간의 합이 목표 시간이 돼요.</p>
    </section>
  );
};

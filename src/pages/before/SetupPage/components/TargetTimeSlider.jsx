import {
  TARGET_TIME_MAX,
  TARGET_TIME_MIN,
  TARGET_TIME_SCALE,
  TARGET_TIME_STEP,
} from '../constants';
import styles from './TargetTimeSlider.module.scss';

// 미설정일 때 손잡이 위치: 안건 합계를 슬라이더 단위(5분)로 맞추고 범위(5~180분) 안으로
const toSliderValue = (minutes) => {
  const stepped = Math.round(minutes / TARGET_TIME_STEP) * TARGET_TIME_STEP;
  return Math.min(TARGET_TIME_MAX, Math.max(TARGET_TIME_MIN, stepped));
};

// value가 null이면 목표 시간을 정하지 않은 상태 (안건 시간의 합을 목표 시간으로 사용)
// - 미설정: 값과 손잡이 모두 안건 합계를 가리킴 (안건이 없으면 "-", 손잡이는 왼쪽 끝)
//   미설정이어도 회의는 이 안건 합계로 만들어지므로 채움 색도 똑같이 보여줌. 정했는지는 [취소] 버튼으로 구분
// - 미설정에서 슬라이더를 누르기만 해도 그 자리 값으로 정해짐
export const TargetTimeSlider = ({ value, agendaTotalMinutes, onChange }) => {
  const isSet = value !== null;
  const hasAgendaTotal = agendaTotalMinutes > 0;
  let sliderValue = TARGET_TIME_MIN;
  if (isSet) sliderValue = value;
  else if (hasAgendaTotal) sliderValue = toSliderValue(agendaTotalMinutes);

  let displayValue = '-';
  if (isSet) displayValue = `${value}분`;
  else if (hasAgendaTotal) displayValue = `${agendaTotalMinutes}분`;

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
            <strong className={styles.value}>{displayValue}</strong>
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
            className={`${styles.slider} ${isSet || hasAgendaTotal ? styles.sliderActive : ''}`}
            type="range"
            min={TARGET_TIME_MIN}
            max={TARGET_TIME_MAX}
            step={TARGET_TIME_STEP}
            value={sliderValue}
            onChange={(event) => onChange(Number(event.target.value))}
            onClick={(event) => {
              if (!isSet) onChange(Number(event.currentTarget.value));
            }}
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

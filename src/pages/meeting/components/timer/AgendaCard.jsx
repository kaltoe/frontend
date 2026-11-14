import { formatTimer } from '@/pages/meeting/utils/formatTimer';
import {
  getTimerState,
  isOvertimeAgenda,
} from '@/pages/meeting/utils/timerState';
import styles from './AgendaCard.module.scss';

// 원형 타이머
const RING_SIZE = 174;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const getRemainingRatio = (remaining, allocated) => {
  if (remaining < 0) return 1;
  if (allocated <= 0) return 0;
  return Math.min(remaining / allocated, 1);
};

const RingTimer = ({ remainingSeconds, allocatedSeconds, state }) => {
  const ratio = getRemainingRatio(remainingSeconds, allocatedSeconds);
  const remainingLength = RING_LENGTH * ratio;
  const elapsedLength = RING_LENGTH - remainingLength;

  return (
    <div className={styles.ring}>
      <svg
        className={styles.ringSvg}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden
      >
        <circle
          className={styles.ringTrack}
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
        />
        <circle
          className={`${styles.ringProgress} ${styles[state]}`}
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          strokeDasharray={`${remainingLength} ${RING_LENGTH}`}
          strokeDashoffset={-elapsedLength}
        />
      </svg>
      <span className={`${styles.ringTime} ${styles[state]}`} role="timer">
        {formatTimer(remainingSeconds)}
      </span>
    </div>
  );
};

export const AgendaCard = ({ agendas, timer }) => {
  const currentIndex = agendas.findIndex(
    (agenda) => agenda.agendaId === timer.currentAgendaId,
  );
  // 회의가 끝나 진행 중 안건이 없으면 카드를 그리지 않음(빈 화면 방지)
  if (currentIndex === -1) return null;

  const agenda = agendas[currentIndex];
  const nextAgenda = agendas[currentIndex + 1];
  const state = getTimerState(timer.agendaRemainingSeconds);

  return (
    <section
      className={`${styles.card} ${styles[state]}`}
      aria-label="현재 안건"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{agenda.title}</h2>
        {agenda.keywords.length > 0 && (
          <ul className={styles.keywords}>
            {agenda.keywords.map((keyword, index) => (
              <li key={`${keyword}-${index}`} className={styles.keyword}>
                {keyword}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.timerArea}>
          <RingTimer
            remainingSeconds={timer.agendaRemainingSeconds}
            allocatedSeconds={timer.agendaAllocatedSeconds}
            state={state}
          />

          <ol className={styles.steps} aria-label="안건 순서">
            {agendas.map((item, index) => {
              // 진행 바와 같은 규칙: 끝난 안건은 그 안건의 결과만 반영
              let stepState = 'pending';
              if (index === currentIndex) stepState = state;
              else if (index < currentIndex) {
                stepState = isOvertimeAgenda(item) ? 'over' : 'normal';
              }
              return (
                <li key={item.agendaId} className={styles.step}>
                  <span className={styles.stepLabel}>
                    {Math.round(item.allocatedSeconds / 60)}분
                  </span>
                  <span className={`${styles.stepLine} ${styles[stepState]}`} />
                </li>
              );
            })}
          </ol>
        </div>

        <p className={styles.next}>
          {nextAgenda ? `다음 안건: ${nextAgenda.title}` : '마지막 안건'}
        </p>
      </div>
    </section>
  );
};

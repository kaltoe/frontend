import { formatTimer } from '../utils/formatTimer';
import {
  getTimerState,
  getUrgentState,
  isOvertimeAgenda,
} from '../utils/timerState';
import styles from './TotalTimer.module.scss';

const getSegmentRatio = (index, currentIndex, timer) => {
  if (currentIndex === -1 || index < currentIndex) return 1;
  if (index > currentIndex) return 0;

  const { agendaElapsedSeconds, agendaAllocatedSeconds } = timer;
  if (agendaAllocatedSeconds <= 0) return 0;
  return Math.min(agendaElapsedSeconds / agendaAllocatedSeconds, 1);
};

export const TotalTimer = ({ agendas, timer }) => {
  const currentIndex = agendas.findIndex(
    (agenda) => agenda.agendaId === timer.currentAgendaId,
  );
  const plannedMinutes = Math.round(timer.plannedTotalSeconds / 60);

  const totalState = getTimerState(timer.totalRemainingSeconds);

  const agendaState =
    currentIndex === -1
      ? 'normal'
      : getTimerState(timer.agendaRemainingSeconds);

  const urgentState = getUrgentState(totalState, agendaState);

  return (
    <section className={styles.totalTimer} aria-label="전체 회의 타이머">
      <p className={`${styles.label} ${styles[totalState]}`}>
        {totalState === 'over' ? '전체 시간 초과' : '전체 남은 시간'}
      </p>
      <div className={styles.body}>
        <p className={styles.time}>
          <span
            className={`${styles.remaining} ${styles[urgentState]}`}
            role="timer"
          >
            {formatTimer(timer.totalRemainingSeconds)}
          </span>
          <span className={styles.planned}>/{plannedMinutes}</span>
        </p>

        <div className={styles.segments} aria-hidden>
          {agendas.map((agenda, index) => {
            const ratio = getSegmentRatio(index, currentIndex, timer);
            const isCurrent = index === currentIndex;
            // 초과로 끝난 안건은 다음 안건으로 넘어가도 빨간색 유지
            const wasOver = !isCurrent && isOvertimeAgenda(agenda);
            let fillState = totalState;

            if (isCurrent) fillState = urgentState;
            else if (wasOver) fillState = 'over';
            return (
              <div
                key={agenda.agendaId}
                className={styles.segment}
                style={{ flexGrow: agenda.allocatedSeconds }}
              >
                <div
                  className={`${styles.fill} ${styles[fillState]}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

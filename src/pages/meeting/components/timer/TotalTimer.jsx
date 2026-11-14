import { formatTimer } from '@/pages/meeting/utils/formatTimer';
import {
  getTimerState,
  isOvertimeAgenda,
} from '@/pages/meeting/utils/timerState';
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

  return (
    <section className={styles.totalTimer} aria-label="전체 회의 타이머">
      <p className={`${styles.label} ${styles[totalState]}`}>
        {totalState === 'over' ? '전체 시간 초과' : '전체 남은 시간'}
      </p>
      <div className={styles.body}>
        <p className={styles.time}>
          <span
            className={`${styles.remaining} ${styles[totalState]}`}
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
            // 칸 색 = 그 안건의 상태 (전체 시간과는 상관없음)
            // - 진행 중 안건: 안건 남은 시간 기준 (임박 노랑, 초과 빨강)
            // - 끝난 안건: 초과로 끝났으면 빨강, 아니면 기본색
            let fillState = 'normal';
            if (isCurrent) fillState = agendaState;
            else if (isOvertimeAgenda(agenda)) fillState = 'over';
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

import { formatDuration } from '../formatResult';
import { formatDiff } from '../getTimeResult';
import styles from './AgendaResultList.module.scss';

export const AgendaResultList = ({ agendas, timeResult }) => {
  return (
    <ol className={styles.list}>
      {agendas.map((agenda, index) => {
        const result = timeResult?.agendas[index];
        const diffText = result && formatDiff(result.diffMinutes);

        return (
          <li key={agenda.id} className={styles.item}>
            <div className={styles.agenda}>
              <span className={styles.number}>{index + 1}</span>
              <div className={styles.agendaText}>
                <p className={styles.title}>{agenda.title}</p>
                <p className={styles.chatter}>
                  사담 알림{' '}
                  <span
                    className={
                      agenda.chatterCount > 0 ? styles.chatterCount : ''
                    }
                  >
                    {agenda.chatterCount}회
                  </span>
                </p>
              </div>
            </div>

            {result ? (
              <div className={styles.time}>
                <p className={styles.duration}>
                  {formatDuration(result.actualSeconds)}
                </p>
                {diffText && (
                  <p
                    className={`${styles.diff} ${result.diffMinutes > 0 ? styles.diffOver : ''}`}
                  >
                    {diffText}
                  </p>
                )}
              </div>
            ) : (
              <p className={`${styles.duration} ${styles.durationEmpty}`}>
                --:--
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
};

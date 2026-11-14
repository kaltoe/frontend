import { formatDuration } from '../formatResult';
import { LockNotice } from './LockNotice';
import { MeetingInfoCard } from './MeetingInfoCard';
import styles from './ScriptTab.module.scss';

// highlight: 마지막으로 누른 안건 또는 발화 ({ type: 'agenda' | 'utterance', id })
// isLocked: 회의 후 1주일이 지나 결제 전까지 회의 내용을 가린다.
export const ScriptTab = ({ meeting, highlight, isLocked, onSelect }) => {
  const isHighlighted = (type, id) =>
    highlight?.type === type && highlight.id === id;

  return (
    <div className={styles.script}>
      <MeetingInfoCard meeting={meeting} />

      <div
        className={`${styles.groups} ${isLocked ? styles.locked : ''}`}
        inert={isLocked}
      >
        {meeting.agendas.map((agenda, index) => (
          <section key={agenda.id} className={styles.group}>
            <button
              className={`${styles.agendaButton} ${isHighlighted('agenda', agenda.id) ? styles.agendaActive : ''}`}
              type="button"
              onClick={() =>
                onSelect(
                  { type: 'agenda', id: agenda.id },
                  agenda.utterances[0]?.startSeconds ?? 0,
                )
              }
            >
              안건 {index + 1}/{meeting.agendas.length}: {agenda.title}
            </button>

            <ul className={styles.lines}>
              {agenda.utterances.map((utterance) => (
                <li key={utterance.id}>
                  <button
                    className={styles.line}
                    type="button"
                    onClick={() =>
                      onSelect(
                        { type: 'utterance', id: utterance.id },
                        utterance.startSeconds,
                      )
                    }
                  >
                    <span className={styles.time}>
                      {formatDuration(utterance.startSeconds)}
                    </span>
                    <span className={styles.text}>
                      <strong className={styles.speaker}>
                        {utterance.speaker}
                      </strong>
                      {'  '}
                      <span
                        className={
                          isHighlighted('utterance', utterance.id)
                            ? styles.highlight
                            : ''
                        }
                      >
                        {utterance.text}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {isLocked && <LockNotice />}
    </div>
  );
};

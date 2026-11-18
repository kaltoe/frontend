import { retry } from '@/assets';
import { LoadingView } from '@/components/common/LoadingView/LoadingView';
import { formatDuration } from '../formatResult';
import { TRANSCRIPTS_STATUS } from '../useMeetingTranscripts';
import { LockNotice } from './LockNotice';
import { MeetingInfoCard } from './MeetingInfoCard';
import styles from './ScriptTab.module.scss';

// transcripts: API-14 전체 기록 ({ status, groups, retry })
//   groups: 안건별 발화 [{ id, title, startSeconds, utterances: [{ id, startSeconds, speaker, text }] }]
// highlight: 재생 중인(재생 전이면 마지막으로 누른) 안건 또는 발화 ({ type: 'agenda' | 'utterance', id })
// isLocked: 회의 후 1주일이 지나 결제 전까지 회의 내용을 가린다.
export const ScriptTab = ({
  meeting,
  transcripts,
  highlight,
  isLocked,
  onSelect,
}) => {
  const isHighlighted = (type, id) =>
    highlight?.type === type && highlight.id === id;

  // 안건 번호는 결과(API-10)의 안건 순서를 따른다. 발화가 없던 안건은 기록에서 빠진다.
  const getAgendaNumber = (group) =>
    meeting.agendas.findIndex((agenda) => agenda.id === group.id) + 1;

  const renderContent = () => {
    if (transcripts.status === TRANSCRIPTS_STATUS.LOADING) {
      return <LoadingView />;
    }

    if (transcripts.status === TRANSCRIPTS_STATUS.ERROR) {
      return (
        <div className={styles.status}>
          <button
            className={styles.retryButton}
            type="button"
            onClick={transcripts.retry}
          >
            <img src={retry} alt="" />
            회의 내용을 불러오지 못했어요. 다시 시도해주세요.
          </button>
        </div>
      );
    }

    if (transcripts.groups.length === 0) {
      return (
        <div className={styles.status}>
          <p className={styles.empty}>기록된 회의 내용이 없어요.</p>
        </div>
      );
    }

    return (
      <div
        className={`${styles.groups} ${isLocked ? styles.locked : ''}`}
        inert={isLocked}
      >
        {transcripts.groups.map((group) => (
          <section key={group.id} className={styles.group}>
            <button
              className={`${styles.agendaButton} ${isHighlighted('agenda', group.id) ? styles.agendaActive : ''}`}
              type="button"
              onClick={() =>
                onSelect(
                  { type: 'agenda', id: group.id },
                  group.startSeconds ?? group.utterances[0]?.startSeconds ?? 0,
                )
              }
            >
              안건 {getAgendaNumber(group)}/{meeting.agendas.length}:{' '}
              {group.title}
            </button>

            <ul className={styles.lines}>
              {group.utterances.map((utterance) => (
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
                      {/* 대면 회의의 실시간 기록은 화자가 없어 발화만 보여준다. */}
                      {utterance.speaker && (
                        <>
                          <strong className={styles.speaker}>
                            {utterance.speaker}
                          </strong>
                          {'  '}
                        </>
                      )}
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
    );
  };

  return (
    <div className={styles.script}>
      <MeetingInfoCard meeting={meeting} />
      {renderContent()}
      {isLocked && <LockNotice />}
    </div>
  );
};

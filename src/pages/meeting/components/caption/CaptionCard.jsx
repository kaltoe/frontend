import { meetingIconCaption, meetingIconChevron } from '@/assets';
import { getEmptyCaptionText } from '@/pages/meeting/utils/captionStatus';
import { CaptionBadge, CaptionLine } from './Caption';
import styles from './CaptionCard.module.scss';

// 가장 최근 자막 한 줄만 보여주고, 전체는 시트에서
export const CaptionCard = ({
  transcripts,
  partialTranscript,
  status,
  onOpen,
  canOpen = true,
}) => {
  // 인식 중인 자막. 없으면 마지막 확정 자막 노출
  const latest = partialTranscript ?? transcripts.at(-1);

  return (
    <section className={styles.card} aria-label="실시간 자막">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.titleWithIcon}>
            <img src={meetingIconCaption} alt="" width={24} height={24} />
            <h2 className={styles.title}>실시간 자막</h2>
          </span>
          <CaptionBadge status={status} />
        </div>
        <button
          type="button"
          className={styles.more}
          onClick={onOpen}
          disabled={!canOpen}
        >
          전체 보기
          <span className={styles.chevron} aria-hidden>
            <img src={meetingIconChevron} alt="" />
          </span>
        </button>
      </div>

      {latest ? (
        <ul className={styles.list} aria-live="polite">
          <CaptionLine transcript={latest} />
        </ul>
      ) : (
        <p className={styles.empty}>{getEmptyCaptionText(status)}</p>
      )}
    </section>
  );
};

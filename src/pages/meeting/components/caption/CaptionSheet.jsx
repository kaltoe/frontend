import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  meetingIconChevron,
  meetingIconMicOffBody,
  meetingIconMicOffSlash,
  meetingIconMicOn,
} from '@/assets';
import { getEmptyCaptionText } from '@/pages/meeting/utils/captionStatus';
import { formatTimer } from '@/pages/meeting/utils/formatTimer';
import { getTimerState } from '@/pages/meeting/utils/timerState';
import { CaptionBadge, CaptionLine } from './Caption';
import styles from './CaptionSheet.module.scss';

const MicIcon = ({ isOn }) =>
  isOn ? (
    <img src={meetingIconMicOn} alt="" width={26} height={26} />
  ) : (
    <span className={styles.micOff}>
      <img className={styles.micOffBody} src={meetingIconMicOffBody} alt="" />
      <img className={styles.micOffSlash} src={meetingIconMicOffSlash} alt="" />
    </span>
  );

// 시트는 고정. 자막 목록만 스크롤. 새 자막 맨 아래.
export const CaptionSheet = ({
  open,
  onClose,
  agendaOrder,
  agendaCount,
  agendaTitle,
  transcripts,
  partialTranscript,
  status,
  isMicOn,
  canUseMic,
  onMicToggle,
  agendaRemainingSeconds,
}) => {
  const listRef = useRef(null);

  // 시트 뒤 스크롤 블락
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // 열릴 때와 새 자막이 올 때 맨 아래로 스크롤
  const lastText = partialTranscript?.text ?? transcripts.at(-1)?.text;
  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, transcripts.length, lastText]);

  if (!open) return null;

  const timerState = getTimerState(agendaRemainingSeconds);
  const isEmpty = transcripts.length === 0 && !partialTranscript;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="실시간 자막 전체 보기"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.grabber} aria-hidden>
          <span className={styles.grabberBar} />
        </div>

        <header className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>실시간 자막</h2>
              <CaptionBadge status={status} />
            </div>
            <p className={styles.agenda}>
              안건 {agendaOrder}/{agendaCount}: {agendaTitle}
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="닫기"
          >
            <img src={meetingIconChevron} alt="" />
          </button>
        </header>

        <div className={styles.listArea} ref={listRef}>
          {isEmpty ? (
            <p className={styles.empty}>{getEmptyCaptionText(status)}</p>
          ) : (
            <ul className={styles.list} aria-live="polite">
              {transcripts.map((transcript) => (
                <CaptionLine
                  key={transcript.utteranceId}
                  transcript={transcript}
                  variant="sheet"
                />
              ))}
              {partialTranscript && (
                <CaptionLine transcript={partialTranscript} variant="sheet" />
              )}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.mic}
            onClick={onMicToggle}
            disabled={!canUseMic}
            aria-label={isMicOn ? '마이크 끄기' : '마이크 켜기'}
            aria-pressed={isMicOn}
          >
            <MicIcon isOn={isMicOn} />
          </button>
          <span
            className={`${styles.remaining} ${styles[timerState]}`}
            role="timer"
            aria-label="안건 남은 시간"
          >
            {formatTimer(agendaRemainingSeconds)}
          </span>
        </footer>
      </section>
    </div>,
    document.body,
  );
};

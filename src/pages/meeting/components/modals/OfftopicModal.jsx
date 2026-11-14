import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { meetingIconBell } from '@/assets';
import styles from './OfftopicModal.module.scss';

// 1초마다 숫자가 줄고(5 → 1) 다 세면 자동으로 닫힘
export const OfftopicModal = ({
  agendaTitle,
  autoCloseSeconds = 5,
  onRelated,
  onClose,
}) => {
  const [remaining, setRemaining] = useState(autoCloseSeconds);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (remaining <= 1) onClose();
      else setRemaining(remaining - 1);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [remaining, onClose]);

  // 모달 뒤 스크롤 블락
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="offtopic-modal-title"
        aria-describedby="offtopic-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.bell} aria-hidden>
          <img src={meetingIconBell} alt="" width={23.1} height={27.464} />
        </span>

        <div className={styles.body}>
          <div className={styles.texts}>
            <h2 id="offtopic-modal-title" className={styles.title}>
              주제에서 벗어났어요.
            </h2>
            <p id="offtopic-modal-description" className={styles.description}>
              지금 안건은 ‘{agendaTitle}’이에요.
              <br />
              다시 집중해볼까요?
            </p>
          </div>

          <div className={styles.footer}>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.related}
                onClick={onRelated}
              >
                관련 있는 이야기에요.
              </button>
              <button type="button" className={styles.close} onClick={onClose}>
                닫기
              </button>
            </div>
            <p className={styles.countdown} aria-live="polite">
              {remaining}초 후 자동으로 닫혀요.
            </p>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
};

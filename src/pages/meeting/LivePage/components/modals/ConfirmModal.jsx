import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ConfirmModal.module.scss';

export const ConfirmModal = ({
  open,
  title,
  description,
  variant = 'primary',
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <section
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.texts}>
          <h2 id="confirm-modal-title" className={styles.title}>
            {title}
          </h2>
          <p id="confirm-modal-description" className={styles.description}>
            {description}
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${styles.confirm} ${styles[variant]}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
};

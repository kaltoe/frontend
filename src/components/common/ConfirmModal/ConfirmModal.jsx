import styles from './ConfirmModal.module.scss';

// 화면을 어둡게 덮고 확인을 받는 팝업
export const ConfirmModal = ({
  title,
  description,
  cancelLabel = '취소',
  confirmLabel,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className={styles.text}>
          <p id="confirm-modal-title" className={styles.title}>
            {title}
          </p>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={styles.confirmButton}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

import { useEffect } from 'react';
import { meetingIconCloseSmall } from '@/assets';
import styles from './Toast.module.scss';

const DEFAULT_DURATION_MS = 5000;

export const Toast = ({
  variant = 'warning',
  icon,
  message,
  onClose,
  duration = DEFAULT_DURATION_MS,
  className = '',
}) => {
  useEffect(() => {
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [onClose, duration]);

  return (
    <div
      className={`${styles.toast} ${styles[variant]} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.content}>
        {icon && <img src={icon} alt="" width={20} height={20} />}
        <p className={styles.message}>{message}</p>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="알림 닫기"
      >
        <img src={meetingIconCloseSmall} alt="" width={16} height={16} />
      </button>
    </div>
  );
};

import { useEffect, useRef } from 'react';
import { closeSmall } from '@/assets';
import styles from './Toast.module.scss';

const AUTO_CLOSE_MS = 3000;

// 잠깐 떠 있다가 사라지는 알림. 닫기 버튼으로 바로 닫을 수도 있다.
export const Toast = ({ icon, message, onClose }) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.toast} role="status">
      <p className={styles.message}>
        {icon && <img src={icon} alt="" />}
        {message}
      </p>
      <button className={styles.closeButton} type="button" onClick={onClose}>
        <img src={closeSmall} alt="닫기" />
      </button>
    </div>
  );
};

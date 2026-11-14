import { commonIconLoading, commonLogoRun } from '@/assets';
import styles from './LoadingScreen.module.scss';

export const LoadingScreen = ({ message = '로딩 중...', footer = null }) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <img src={commonLogoRun} alt="" width={20} height={20} />
      <span className={styles.logoText}>칼퇴</span>
    </header>

    <div className={styles.status} role="status" aria-live="polite">
      <img
        className={styles.spinner}
        src={commonIconLoading}
        alt=""
        width={32}
        height={32}
      />
      <p className={styles.message}>{message}</p>
    </div>

    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
);

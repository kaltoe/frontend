import { meetingIconLoading } from '@/assets';
import { LogoHeader } from './LogoHeader';
import styles from './LoadingScreen.module.scss';

// 회의 로딩 화면 (처음 불러올 때, 새로고침, 재접속 중)
export const LoadingScreen = ({ message = '로딩 중...' }) => (
  <div className={styles.page}>
    <LogoHeader />

    <div className={styles.status} role="status" aria-live="polite">
      <img
        className={styles.spinner}
        src={meetingIconLoading}
        alt=""
        width={32}
        height={32}
      />
      <p className={styles.message}>{message}</p>
    </div>
  </div>
);

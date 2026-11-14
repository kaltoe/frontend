import { meetingLogoRun } from '@/assets';
import styles from './LogoHeader.module.scss';

// "칼퇴" 로고 헤더
export const LogoHeader = () => (
  <header className={styles.header}>
    <img src={meetingLogoRun} alt="" width={20} height={20} />
    <span className={styles.logoText}>칼퇴</span>
  </header>
);

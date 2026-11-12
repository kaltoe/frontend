import { logoRun } from '@/assets';
import styles from './Header.module.scss';

// 화면 상단의 로고 헤더
export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logoRun} alt="" />
        <span className={styles.logoText}>칼퇴</span>
      </div>
    </header>
  );
};

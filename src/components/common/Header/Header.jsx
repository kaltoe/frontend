import { logoRun } from '@/assets';
import styles from './Header.module.scss';

// 화면 상단의 로고 헤더 (children은 오른쪽 끝에 놓는다)
export const Header = ({ children }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logoRun} alt="" />
        <span className={styles.logoText}>칼퇴</span>
      </div>
      {children}
    </header>
  );
};

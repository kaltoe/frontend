import { useNavigate } from 'react-router-dom';
import { meetingIconLinkBroken, meetingLogoRunWhite } from '@/assets';
import { LogoHeader } from './LogoHeader';
import styles from './ErrorScreen.module.scss';

// 에러 화면 (만료되었거나 잘못된 링크, 끝난 회의 등)
export const ErrorScreen = ({ title = '만료되었거나 잘못된 링크예요.' }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <LogoHeader />

      <div className={styles.status} role="alert">
        <img src={meetingIconLinkBroken} alt="" width={22} height={26} />
        <p className={styles.title}>{title}</p>
      </div>

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.startButton}
          onClick={() => navigate('/')}
        >
          <img src={meetingLogoRunWhite} alt="" width={20} height={19} />
          칼퇴 시작하기
        </button>
      </div>
    </div>
  );
};

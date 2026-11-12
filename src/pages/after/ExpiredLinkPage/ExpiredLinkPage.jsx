import { useNavigate } from 'react-router-dom';
import { linkGray, runWhite } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { Header } from '@/components/common/Header/Header';
import styles from './ExpiredLinkPage.module.scss';

// 만료되었거나 잘못된 링크로 들어왔을 때 보여주는 화면
export const ExpiredLinkPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.message}>
        <img src={linkGray} alt="" />
        <div className={styles.text}>
          <h1 className={styles.title}>만료되었거나 잘못된 링크예요.</h1>
          <p className={styles.description}>
            공유 링크는 회의가 끝난 뒤 2주 동안만 볼 수 있어요.
          </p>
        </div>
      </main>

      <BottomBar icon={runWhite} onClick={() => navigate('/')}>
        칼퇴 시작하기
      </BottomBar>
    </div>
  );
};

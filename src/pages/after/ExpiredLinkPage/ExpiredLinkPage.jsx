import { useLocation, useNavigate } from 'react-router-dom';
import { linkGray, runWhite } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { Header } from '@/components/common/Header/Header';
import styles from './ExpiredLinkPage.module.scss';
import { EXPIRED_LINK_REASON } from './expiredLinkReason';

const MESSAGES = {
  [EXPIRED_LINK_REASON.NO_RESULT_ACCESS]: {
    title: '회의 결과에 접근할 수 없어요.',
  },
};

const DEFAULT_MESSAGE = {
  title: '만료되었거나 잘못된 링크예요.',
  description: '공유 링크는 회의가 끝난 뒤 7일 동안만 볼 수 있어요.',
};

// 만료되었거나 잘못된 링크로 들어왔을 때 보여주는 화면
// state.reason에 따라 문구를 바꾼다 (expiredLinkReason.js)
export const ExpiredLinkPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const message = MESSAGES[state?.reason] ?? DEFAULT_MESSAGE;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.message}>
        <img src={linkGray} alt="" />
        <div className={styles.text}>
          <h1 className={styles.title}>{message.title}</h1>
          {message.description && (
            <p className={styles.description}>{message.description}</p>
          )}
        </div>
      </main>

      <BottomBar icon={runWhite} onClick={() => navigate('/')}>
        칼퇴 시작하기
      </BottomBar>
    </div>
  );
};

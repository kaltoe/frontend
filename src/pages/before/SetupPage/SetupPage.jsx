import { playGray } from '@/assets';
import { BackHeader } from '@/components/common/BackHeader/BackHeader';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import styles from './SetupPage.module.scss';

export const SetupPage = () => {
  return (
    <div className={styles.page}>
      <BackHeader title="회의 만들기" />

      <main className={styles.content}>
        <div className={styles.headline}>
          <h1 className={styles.title}>어떤 회의를 할까요?</h1>
          <p className={styles.description}>
            제목과 안건, 목표 시간을 정해주세요.
          </p>
        </div>
      </main>

      <BottomBar icon={playGray} disabled>
        회의 시작하기
      </BottomBar>
    </div>
  );
};

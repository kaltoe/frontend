import { lockOlive } from '@/assets';
import styles from './LockNotice.module.scss';

export const LockNotice = () => {
  return (
    <div className={styles.notice}>
      <img src={lockOlive} alt="" />
      <div className={styles.text}>
        <p className={styles.title}>1주일이 지났어요.</p>
        <p className={styles.description}>
          회의 내용을 보려면 결제를 진행해주세요.
        </p>
      </div>
    </div>
  );
};

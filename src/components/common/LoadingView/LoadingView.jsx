import { loading } from '@/assets';
import styles from './LoadingView.module.scss';

// 화면 가운데에 띄우는 로딩 표시. 부모 요소에 position: relative가 필요하다.
export const LoadingView = () => {
  return (
    <div className={styles.loading} role="status">
      <img className={styles.spinner} src={loading} alt="" />
      <p className={styles.loadingText}>로딩 중...</p>
    </div>
  );
};

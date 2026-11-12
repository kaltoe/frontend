import { useNavigate } from 'react-router-dom';
import { chevronLeft } from '@/assets';
import styles from './BackHeader.module.scss';

// 뒤로가기 버튼과 화면 제목이 있는 헤더
export const BackHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <button
        className={styles.backButton}
        type="button"
        onClick={() => navigate(-1)}
      >
        <img src={chevronLeft} alt="" />
        <span className={styles.title}>{title}</span>
      </button>
    </header>
  );
};

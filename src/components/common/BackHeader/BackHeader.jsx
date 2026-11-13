import { useNavigate } from 'react-router-dom';
import { chevronLeft } from '@/assets';
import styles from './BackHeader.module.scss';

// 뒤로가기 버튼과 화면 제목이 있는 헤더
// backTo: 뒤로가기 시 이동할 경로 (없으면 브라우저 이전 화면으로 이동)
export const BackHeader = ({ title, backTo }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <header className={styles.header}>
      <button className={styles.backButton} type="button" onClick={handleBack}>
        <img src={chevronLeft} alt="" />
        <span className={styles.title}>{title}</span>
      </button>
    </header>
  );
};

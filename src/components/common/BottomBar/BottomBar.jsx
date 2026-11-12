import styles from './BottomBar.module.scss';

// 화면 하단에 고정되는 주요 버튼
// icon: 버튼 글자 앞에 놓는 아이콘 이미지 경로
export const BottomBar = ({ icon, onClick, disabled = false, children }) => {
  return (
    <footer className={styles.bottomBar}>
      <button
        className={styles.button}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <img src={icon} alt="" />}
        <span className={styles.buttonText}>{children}</span>
      </button>
    </footer>
  );
};

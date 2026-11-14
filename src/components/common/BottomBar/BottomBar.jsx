import { infoGray, infoRed } from '@/assets';
import styles from './BottomBar.module.scss';

// 화면 하단에 고정되는 주요 버튼
// icon: 버튼 글자 앞에 놓는 아이콘 이미지 경로
// notice: 버튼 위에 띄우는 안내 문구 (noticeType이 'danger'면 빨간 배경으로 강조)
// floating: 하단 바 바로 위에 띄우는 요소 (토스트 등)
// header: 하단 바 안에서 버튼 위에 두는 요소 (녹음 플레이어 등)
export const BottomBar = ({
  icon,
  onClick,
  disabled = false,
  notice,
  noticeType = 'info',
  floating,
  header,
  children,
}) => {
  const isDanger = Boolean(notice) && noticeType === 'danger';

  return (
    <footer
      className={`${styles.bottomBar} ${isDanger ? styles.danger : ''} ${header ? styles.withHeader : ''}`}
    >
      {floating && <div className={styles.floating}>{floating}</div>}
      {header}
      {notice && (
        <p className={styles.notice}>
          <span className={styles.noticeIcon}>
            <img src={isDanger ? infoRed : infoGray} alt="" />
          </span>
          {notice}
        </p>
      )}
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

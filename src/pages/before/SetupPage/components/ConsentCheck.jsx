import { checkboxChecked } from '@/assets';
import styles from './ConsentCheck.module.scss';

export const ConsentCheck = ({ checked, onChange }) => {
  return (
    <section className={styles.consent}>
      <label className={styles.checkRow}>
        <input
          className={styles.checkInput}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={styles.checkBox} aria-hidden="true">
          {checked && <img src={checkboxChecked} alt="" />}
        </span>
        <span className={styles.checkLabel}>[동의] 음성 녹음 및 AI 분석</span>
      </label>
      <p className={styles.description}>
        회의 음성은 녹음되어 다시 듣기, 실시간 자막, 주제 이탈 감지, 회의록
        요약에만 쓰여요.
      </p>
    </section>
  );
};

import styles from './IconInput.module.scss';

// 앞에 아이콘이 붙은 입력칸. 나머지 props는 input에 그대로 넘긴다.
export const IconInput = ({ icon, isError = false, ...inputProps }) => {
  return (
    <label className={`${styles.box} ${isError ? styles.boxError : ''}`}>
      <img className={styles.icon} src={icon} alt="" />
      <input
        className={styles.input}
        type="text"
        autoComplete="off"
        {...inputProps}
      />
    </label>
  );
};

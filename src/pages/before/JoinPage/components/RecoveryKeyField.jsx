import { useState } from 'react';
import { lock } from '@/assets';
import { IconInput } from './IconInput';
import styles from './RecoveryKeyField.module.scss';

export const RecoveryKeyField = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 접으면 입력한 키도 함께 지워 진행자로 잘못 들어가지 않게 한다.
  const handleClose = () => {
    setIsOpen(false);
    onChange('');
  };

  if (!isOpen) {
    return (
      <button
        className={`${styles.textButton} ${styles.openButton}`}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        진행자로 다시 들어오시나요? 복구 키 입력하기
      </button>
    );
  }

  return (
    <section className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor="join-recovery-key">
          진행자 복구 키
        </label>
        <button
          className={styles.textButton}
          type="button"
          onClick={handleClose}
        >
          접기
        </button>
      </div>
      <div className={styles.inputGroup}>
        <IconInput
          id="join-recovery-key"
          icon={lock}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="복구 키를 입력하세요."
          autoFocus
        />
        <p className={styles.hint}>
          회의를 만들 때 받은 키를 입력하면 진행자로 들어가요.
        </p>
      </div>
    </section>
  );
};

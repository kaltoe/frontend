import { chevronDown, chevronUp } from '@/assets';
import styles from './SummaryItem.module.scss';

export const SummaryItem = ({ order, agenda, isOpen, onToggle }) => {
  return (
    <li className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
      <button
        className={styles.toggle}
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className={styles.agenda}>
          <span className={styles.number}>{order}</span>
          <span className={styles.title}>{agenda.title}</span>
        </span>
        <img src={isOpen ? chevronUp : chevronDown} alt="" />
      </button>

      {isOpen && (
        <ul className={styles.lines}>
          {agenda.summary.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
    </li>
  );
};

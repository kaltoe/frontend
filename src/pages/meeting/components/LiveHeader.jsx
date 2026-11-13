import { BsPeopleFill } from 'react-icons/bs';
import { FaUserPlus } from 'react-icons/fa6';
import styles from './LiveHeader.module.scss';

export const LiveHeader = ({ title, participantCount, onInviteClick }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <div
          className={styles.people}
          aria-label={`참여 인원 ${participantCount}명`}
        >
          <BsPeopleFill className={styles.peopleIcon} aria-hidden />
          <span className={styles.count}>{participantCount}</span>
        </div>
        <button
          type="button"
          className={styles.inviteButton}
          onClick={onInviteClick}
          aria-label="팀원 초대"
        >
          <FaUserPlus aria-hidden />
        </button>
      </div>
    </header>
  );
};

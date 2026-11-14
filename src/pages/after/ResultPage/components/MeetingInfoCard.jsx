import { people } from '@/assets';
import { formatMeetingPeriod } from '../formatResult';
import styles from './MeetingInfoCard.module.scss';

// 참여 인원·회의 시간·제목을 담은 카드. children은 제목 아래에 이어 붙는다.
export const MeetingInfoCard = ({ meeting, children }) => {
  return (
    <section
      className={`${styles.card} ${children ? styles.cardWithContent : ''}`}
    >
      <div className={styles.info}>
        <div className={styles.meta}>
          <p className={styles.participants}>
            <img src={people} alt="" />
            {meeting.participantCount}
          </p>
          <p className={styles.period}>
            {formatMeetingPeriod(meeting.startedAt, meeting.endedAt)}
          </p>
        </div>
        <h1 className={styles.title}>{meeting.title}</h1>
      </div>
      {children}
    </section>
  );
};

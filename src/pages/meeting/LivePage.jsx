import { LiveHeader } from './components/LiveHeader';
import { mockMeeting } from './mockMeeting';
import styles from './LivePage.module.scss';

export const LivePage = () => {
  const meeting = mockMeeting;

  return (
    <div className={styles.page}>
      <LiveHeader
        title={meeting.title}
        participantCount={meeting.participantCount}
        onInviteClick={() => {
          // TODO: 팀원 초대 팝업 (#21)
        }}
      />

      <main className={styles.content}>
        {/* TODO: 전체 타이머 (#23) */}
        {/* TODO: 안건 카드 (#25, #26) */}
        {/* TODO: 실시간 자막 카드 (#31, #33) */}
      </main>

      {/* TODO: 하단 컨트롤 바 (#27, #28, #30, #39, #40) */}
    </div>
  );
};

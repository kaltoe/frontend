import { AgendaCard } from './components/AgendaCard';
import { LiveHeader } from './components/LiveHeader';
import { TotalTimer } from './components/TotalTimer';
import { useMeetingTimer } from './hooks/useMeetingTimer';
import { mockMeeting } from './mockMeeting';
import styles from './LivePage.module.scss';

export const LivePage = () => {
  const meeting = mockMeeting;
  const timer = useMeetingTimer(meeting.timer);

  return (
    <div className={styles.page}>
      <LiveHeader
        title={meeting.title}
        participantCount={meeting.connectedCount}
        onInviteClick={() => {
          // TODO: 팀원 초대 팝업 (#21)
        }}
      />

      <main className={styles.content}>
        <div className={styles.timerArea}>
          <TotalTimer agendas={meeting.agendas} timer={timer} />
          <AgendaCard agendas={meeting.agendas} timer={timer} />
        </div>
        {/* TODO: 실시간 자막 카드 (#31, #33) */}
      </main>

      {/* TODO: 하단 컨트롤 바 (#27, #28, #30, #39, #40) */}
    </div>
  );
};

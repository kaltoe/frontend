import { playGray, playWhite } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { useInviteModal } from '../../hooks/useInviteModal';
import { useMeetingTimer } from '../../hooks/useMeetingTimer';
import { LiveHeader } from '../header/LiveHeader';
import { InviteModal } from '../modals/InviteModal';
import { AgendaCard } from '../timer/AgendaCard';
import { TotalTimer } from '../timer/TotalTimer';
import styles from './WaitingMeeting.module.scss';

// 대기(WAITING) 화면: 회의를 만들었지만 아직 [회의 시작]을 누르지 않은 상태
// - 타이머는 멈춘 채로 첫 안건(currentAgendaId)과 시간을 보여줌
// - 진행자: [회의 시작] 버튼 / 참여자: 시작을 기다린다는 안내
// TODO: 디자인 받으면 화면 교체, 입장 현황 "3/5명 입장"(connectedCount/attendeeCount)
export const WaitingMeeting = ({ meeting, start }) => {
  const isHost = meeting.me.role === 'HOST';
  const { isInviteOpen, openInvite, closeInvite } = useInviteModal(isHost);
  const timer = useMeetingTimer(meeting.timer);

  return (
    <div className={styles.page}>
      <LiveHeader
        title={meeting.title}
        participantCount={meeting.connectedCount}
        onInviteClick={openInvite}
      />

      <main className={styles.content}>
        <p className={styles.notice} role="status">
          {isHost
            ? '팀원이 모두 들어오면 회의를 시작해주세요.'
            : '진행자가 회의를 시작하기를 기다리고 있어요.'}
        </p>
        <div className={styles.timerArea}>
          <TotalTimer agendas={meeting.agendas} timer={timer} />
          <AgendaCard agendas={meeting.agendas} timer={timer} />
        </div>
      </main>

      {isHost ? (
        <BottomBar icon={playWhite} onClick={start}>
          회의 시작
        </BottomBar>
      ) : (
        <BottomBar
          icon={playGray}
          disabled
          notice="진행자가 시작하면 타이머가 바로 움직여요."
        >
          대기 중
        </BottomBar>
      )}

      <InviteModal
        open={isInviteOpen}
        invite={meeting.invite}
        recoveryKey={isHost ? meeting.hostRecoveryKey : null}
        onClose={closeInvite}
      />
    </div>
  );
};

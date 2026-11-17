import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  meetingIconChatWarning,
  meetingIconMicOffSmall,
  meetingIconStop,
} from '@/assets';
import { CaptionCard } from './components/caption/CaptionCard';
import { CaptionSheet } from './components/caption/CaptionSheet';
import { Toast } from './components/common/Toast';
import { ControlBar } from './components/controls/ControlBar';
import { LiveHeader } from './components/header/LiveHeader';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { InviteModal } from './components/modals/InviteModal';
import { OfftopicModal } from './components/modals/OfftopicModal';
import { ErrorScreen } from './components/status/ErrorScreen';
import { LoadingScreen } from './components/status/LoadingScreen';
import { AgendaCard } from './components/timer/AgendaCard';
import { TotalTimer } from './components/timer/TotalTimer';
import { useAutoPauseOnMicDenied } from './hooks/useAutoPauseOnMicDenied';
import { useInviteModal } from './hooks/useInviteModal';
import { useLiveMeeting } from './hooks/useLiveMeeting';
import { useMeetingAlerts } from './hooks/useMeetingAlerts';
import { useMeetingTimer } from './hooks/useMeetingTimer';
import { getCaptionStatus } from './utils/captionStatus';
import styles from './LivePage.module.scss';

// 음성 관련 토스트
const CAPTION_TOASTS = {
  noAudio: {
    variant: 'danger',
    icon: meetingIconMicOffSmall,
    message: '회의 진행을 위해 마이크 권한을 허용해주세요.',
  },
  stopped: {
    variant: 'warning',
    icon: meetingIconChatWarning,
    message: '마이크를 끄는 동안은 회의가 기록되지 않아요.',
  },
};

// 일시정지 토스트: 정지되면 모두에게 뜨고, 5초 뒤/X/재개 시 닫힘
const PAUSE_TOAST = {
  variant: 'warning',
  icon: meetingIconStop,
  message: '일시정지되었습니다.',
};

// 확인 모달 (#39 안건 전환, #40 회의 종료)
const CONFIRM_MODALS = {
  next: {
    title: '안건을 전환할까요?',
    description: '현재 안건은 종료되고 다음 안건으로 이어져요.',
    variant: 'primary',
  },
  end: {
    title: '회의를 종료할까요?',
    description: '지금까지의 회의 내용으로만 기록돼요.',
    variant: 'danger',
  },
};

// 회의 데이터를 받은 뒤에 그리는 화면
const LiveMeeting = ({
  meeting,
  pause,
  resume,
  goToNextAgenda,
  start,
  isStarting,
  end,
  isEnding,
  toggleMic,
  closeOfftopic,
  dismissOfftopic,
}) => {
  const offtopicEvent = meeting.activeOfftopicEvent;
  const isHost = meeting.me.role === 'HOST';

  const { isInviteOpen, openInvite, closeInvite } = useInviteModal(isHost);

  const isWaiting = meeting.status === 'WAITING';
  const inviteFooter = isWaiting ? (isHost ? 'start' : 'waiting') : 'close';

  const handleStart = async () => {
    await start();
    closeInvite();
  };
  const timer = useMeetingTimer(meeting.timer);

  // 진행자 마이크 권한이 없으면 자동 일시 정지, 허용하면 자동 재개
  useAutoPauseOnMicDenied({
    isHost,
    micState: meeting.me.micState,
    timer,
    pause,
    resume,
  });

  // 전체 시간 00:00, 사담 경고 알림음 (#23, #35)
  useMeetingAlerts({
    totalRemainingSeconds: timer.totalRemainingSeconds,
    offtopicEventId: offtopicEvent?.eventId,
  });

  const [isCaptionSheetOpen, setIsCaptionSheetOpen] = useState(false);
  const closeCaptionSheet = useCallback(() => setIsCaptionSheetOpen(false), []);
  // 'next' | 'end' | null
  const [confirmModal, setConfirmModal] = useState(null);
  const closeConfirmModal = useCallback(() => setConfirmModal(null), []);

  const currentIndex = meeting.agendas.findIndex(
    (agenda) => agenda.agendaId === timer.currentAgendaId,
  );
  const currentAgenda = meeting.agendas[currentIndex];

  const isMicOn = meeting.me.micState === 'ON';
  const isPaused = timer.status === 'PAUSED';

  // 일시정지 토스트와 자막 토스트는 같은 자리에 뜸 → 나중에 뜬 토스트만 보여줌
  // 단, 진행자 마이크 권한이 없어서 멈춘 경우는 권한 토스트만 보여줌 (진행자가 할 일은 권한 허용)
  const isHostMicDenied = isHost && meeting.me.micState === 'DENIED';

  // 정지되는 순간 토스트를 띄우고, 재개되면 닫음 (새로고침해서 이미 정지 상태로 들어오면 안 띄움)
  const [prevIsPaused, setPrevIsPaused] = useState(isPaused);
  const [isPauseToastOpen, setIsPauseToastOpen] = useState(false);
  const [captionToast, setCaptionToast] = useState(null);
  if (isPaused !== prevIsPaused) {
    setPrevIsPaused(isPaused);
    if (!isPaused) {
      setIsPauseToastOpen(false);
    } else if (!isHostMicDenied) {
      setIsPauseToastOpen(true);
      setCaptionToast(null);
    }
  }
  const closePauseToast = useCallback(() => setIsPauseToastOpen(false), []);

  const captionStatus = getCaptionStatus({
    micState: meeting.me.micState,
    sttStatus: meeting.sttStatus,
  });
  // 자막 상태가 바뀔 때마다 그 상태의 토스트를 새로 띄움
  // 처음 들어올 때 이미 토스트가 필요한 상태면 바로 띄움
  const [prevCaptionStatus, setPrevCaptionStatus] = useState(null);
  if (captionStatus !== prevCaptionStatus) {
    setPrevCaptionStatus(captionStatus);
    const nextToast = CAPTION_TOASTS[captionStatus] ? captionStatus : null;
    setCaptionToast(nextToast);
    if (nextToast) setIsPauseToastOpen(false);
  }
  const closeCaptionToast = useCallback(() => setCaptionToast(null), []);

  // 진행자는 항상, 참여자는 비대면일 때만 마이크를 켜고 끌 수 있음 (#30)
  // 마이크 권한이 없으면 누구도 켤 수 없음
  const canUseMic =
    (isHost || meeting.meetingMode === 'REMOTE') &&
    meeting.me.micState !== 'DENIED';

  const handlePauseToggle = () => {
    if (isPaused) resume(timer);
    else pause(timer);
  };

  const handleConfirm = () => {
    if (confirmModal === 'next') {
      goToNextAgenda(timer);
    } else if (confirmModal === 'end') {
      end();
    }
    setConfirmModal(null);
  };

  return (
    <div className={styles.page}>
      <LiveHeader
        title={meeting.title}
        participantCount={meeting.connectedCount}
        onInviteClick={openInvite}
      />

      <main className={styles.content}>
        <div className={styles.timerArea}>
          <TotalTimer agendas={meeting.agendas} timer={timer} />
          <AgendaCard agendas={meeting.agendas} timer={timer} />
        </div>
        <CaptionCard
          transcripts={meeting.transcripts}
          partialTranscript={meeting.partialTranscript}
          status={captionStatus}
          onOpen={() => setIsCaptionSheetOpen(true)}
          // 음성 미감지일 때는 전체 보기 비활성화
          canOpen={captionStatus !== 'noAudio'}
        />
      </main>

      {isPauseToastOpen && (
        <Toast
          className={styles.toast}
          {...PAUSE_TOAST}
          fit
          onClose={closePauseToast}
        />
      )}

      {captionToast && (
        <Toast
          key={captionToast}
          className={styles.toast}
          {...CAPTION_TOASTS[captionToast]}
          onClose={closeCaptionToast}
        />
      )}

      <ControlBar
        isHost={isHost}
        isMicOn={isMicOn}
        canUseMic={canUseMic}
        isPaused={isPaused}
        isLastAgenda={currentIndex === meeting.agendas.length - 1}
        isEnding={isEnding}
        onMicToggle={toggleMic}
        onPauseToggle={handlePauseToggle}
        onNext={() => setConfirmModal('next')}
        onEnd={() => setConfirmModal('end')}
      />

      <ConfirmModal
        open={confirmModal !== null}
        {...CONFIRM_MODALS[confirmModal]}
        onConfirm={handleConfirm}
        onCancel={closeConfirmModal}
      />

      <InviteModal
        open={isWaiting || isInviteOpen}
        invite={meeting.invite}
        connectedCount={meeting.connectedCount}
        attendeeCount={meeting.attendeeCount}
        recoveryKey={isHost ? meeting.hostRecoveryKey : null}
        footer={inviteFooter}
        isStarting={isStarting}
        onStart={handleStart}
        onClose={closeInvite}
      />

      {offtopicEvent && (
        <OfftopicModal
          key={offtopicEvent.eventId}
          agendaTitle={offtopicEvent.agendaTitle}
          autoCloseSeconds={offtopicEvent.autoCloseSeconds}
          onRelated={() => dismissOfftopic(offtopicEvent.eventId)}
          onClose={closeOfftopic}
        />
      )}

      {currentAgenda && (
        <CaptionSheet
          open={isCaptionSheetOpen}
          onClose={closeCaptionSheet}
          agendaOrder={currentIndex + 1}
          agendaCount={meeting.agendas.length}
          agendaTitle={currentAgenda.title}
          transcripts={meeting.transcripts}
          partialTranscript={meeting.partialTranscript}
          status={captionStatus}
          isMicOn={isMicOn}
          canUseMic={canUseMic}
          onMicToggle={toggleMic}
          agendaRemainingSeconds={timer.agendaRemainingSeconds}
        />
      )}
    </div>
  );
};

// 회의 상태(API-04)를 불러오는 동안 로딩, 실패하면 에러 화면
export const LivePage = () => {
  const { meetingId } = useParams();
  const { connection, meeting, ...actions } = useLiveMeeting(meetingId);

  if (connection === 'error') return <ErrorScreen />;
  if (connection !== 'connected' || !meeting) return <LoadingScreen />;

  return <LiveMeeting meeting={meeting} {...actions} />;
};

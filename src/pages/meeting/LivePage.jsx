import { useCallback, useState } from 'react';
import { meetingIconChatWarning, meetingIconMicOffSmall } from '@/assets';
import { AgendaCard } from './components/AgendaCard';
import { CaptionCard } from './components/CaptionCard';
import { CaptionSheet } from './components/CaptionSheet';
import { ConfirmModal } from './components/ConfirmModal';
import { ControlBar } from './components/ControlBar';
import { LiveHeader } from './components/LiveHeader';
import { Toast } from './components/Toast';
import { TotalTimer } from './components/TotalTimer';
import { useLiveMeeting } from './hooks/useLiveMeeting';
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

export const LivePage = () => {
  const { meeting, pause, resume, toggleMic } = useLiveMeeting();
  const timer = useMeetingTimer(meeting.timer);
  const [isCaptionSheetOpen, setIsCaptionSheetOpen] = useState(false);
  const closeCaptionSheet = useCallback(() => setIsCaptionSheetOpen(false), []);
  // 'next' | 'end' | null
  const [confirmModal, setConfirmModal] = useState(null);
  const closeConfirmModal = useCallback(() => setConfirmModal(null), []);

  const currentIndex = meeting.agendas.findIndex(
    (agenda) => agenda.agendaId === timer.currentAgendaId,
  );
  const currentAgenda = meeting.agendas[currentIndex];

  const captionStatus = getCaptionStatus({
    micState: meeting.me.micState,
    sttStatus: meeting.sttStatus,
  });
  // 자막 상태가 바뀔 때마다 그 상태의 토스트를 새로 띄움
  // (렌더 중 이전 값과 비교하는 React 권장 방식. effect 안 setState를 피함)
  const [prevCaptionStatus, setPrevCaptionStatus] = useState(captionStatus);
  const [captionToast, setCaptionToast] = useState(
    CAPTION_TOASTS[captionStatus] ? captionStatus : null,
  );
  if (captionStatus !== prevCaptionStatus) {
    setPrevCaptionStatus(captionStatus);
    setCaptionToast(CAPTION_TOASTS[captionStatus] ? captionStatus : null);
  }
  const closeCaptionToast = useCallback(() => setCaptionToast(null), []);

  const isHost = meeting.me.role === 'HOST';
  const isMicOn = meeting.me.micState === 'ON';
  const isPaused = timer.status === 'PAUSED';
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
      // TODO: API-07 POST /meetings/{meetingId}/agendas/next
    } else if (confirmModal === 'end') {
      // TODO: API-08 POST /meetings/{meetingId}/end → 회의 후 화면으로 이동
    }
    setConfirmModal(null);
  };

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
        <CaptionCard
          transcripts={meeting.transcripts}
          partialTranscript={meeting.partialTranscript}
          status={captionStatus}
          onOpen={() => setIsCaptionSheetOpen(true)}
          // 음성 미감지일 때는 전체 보기 비활성화
          canOpen={captionStatus !== 'noAudio'}
        />
      </main>

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

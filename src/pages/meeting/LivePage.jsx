import { useCallback, useState } from 'react';
import { meetingIconChatWarning, meetingIconMicOffSmall } from '@/assets';
import { AgendaCard } from './components/AgendaCard';
import { CaptionCard } from './components/CaptionCard';
import { CaptionSheet } from './components/CaptionSheet';
import { LiveHeader } from './components/LiveHeader';
import { Toast } from './components/Toast';
import { TotalTimer } from './components/TotalTimer';
import { useMeetingTimer } from './hooks/useMeetingTimer';
import { mockMeeting } from './mockMeeting';
import { getCaptionStatus } from './utils/captionStatus';
import styles from './LivePage.module.scss';

// 자막 상태가 바뀌면 띄우는 토스트 (#29). 5초 뒤 자동으로 사라짐
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

export const LivePage = () => {
  const meeting = mockMeeting;
  const timer = useMeetingTimer(meeting.timer);
  const [isCaptionSheetOpen, setIsCaptionSheetOpen] = useState(false);
  const closeCaptionSheet = useCallback(() => setIsCaptionSheetOpen(false), []);

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

  // 진행자는 항상, 참여자는 비대면일 때만 마이크를 켜고 끌 수 있음 (#30)
  const canUseMic =
    meeting.me.role === 'HOST' || meeting.meetingMode === 'REMOTE';

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

      {/* TODO: 하단 컨트롤 바 (#27, #28, #30, #39, #40) */}

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
          isMicOn={meeting.me.micState === 'ON'}
          canUseMic={canUseMic}
          onMicToggle={() => {
            // TODO: 마이크 켜기/끄기 (#28) — 하단 컨트롤 바와 같은 동작
          }}
          agendaRemainingSeconds={timer.agendaRemainingSeconds}
        />
      )}
    </div>
  );
};

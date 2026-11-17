import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { copyCheck, linkWhite, retry } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { ConfirmModal } from '@/components/common/ConfirmModal/ConfirmModal';
import { Header } from '@/components/common/Header/Header';
import { LoadingView } from '@/components/common/LoadingView/LoadingView';
import { Toast } from '@/components/common/Toast/Toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { AgendaResultList } from './components/AgendaResultList';
import { AudioPlayer } from './components/AudioPlayer';
import { MeetingInfoCard } from './components/MeetingInfoCard';
import { ResultTabs } from './components/ResultTabs';
import { ScriptTab } from './components/ScriptTab';
import { SummaryTab } from './components/SummaryTab';
import { TimerRing } from './components/TimerRing';
import { RESULT_TABS } from './constants';
import { formatDate } from './formatResult';
import { getSummaryText } from './getSummaryText';
import { getTimeResult } from './getTimeResult';
import { isScriptLockPassed } from './scriptLock';
import styles from './ResultPage.module.scss';
import { useAudioPlayer } from './useAudioPlayer';
import { RECORDING_STATUS, useMeetingRecording } from './useMeetingRecording';
import { useMeetingResult } from './useMeetingResult';
import { useMeetingSummary } from './useMeetingSummary';
import {
  TRANSCRIPTS_STATUS,
  useMeetingTranscripts,
} from './useMeetingTranscripts';
import { SHARE_RESULT, useShareLink } from './useShareLink';

const COPIED_TOAST = { icon: copyCheck, message: '복사되었습니다!' };
// 공유 링크 발급 결과별 토스트 (문구는 서버 안내 문구와 같다)
const SHARE_TOASTS = {
  [SHARE_RESULT.COPIED]: COPIED_TOAST,
  [SHARE_RESULT.EXPIRED]: {
    message: '공유 기간(회의 종료 후 7일)이 지났어요.',
  },
  [SHARE_RESULT.FAILED]: {
    message: '링크를 만들지 못했어요. 잠시 후 다시 시도해주세요.',
  },
};

// readOnly: 공유 링크로 들어온 화면. 공유 버튼 없이 볼 수 있는 기한을 알려준다.
export const ResultPage = ({ readOnly = false }) => {
  const { meetingId, shareId } = useParams();
  // 다른 회의·공유 화면으로 옮기면 이전 회의의 값과 탭·재생 상태를 버리고 새로 시작한다.
  return (
    <ResultLoader
      key={readOnly ? `share-${shareId}` : meetingId}
      meetingId={meetingId}
      readOnly={readOnly}
    />
  );
};

const ResultLoader = ({ meetingId, readOnly }) => {
  // API-10 회의 결과 (401 → 만료 링크 화면, 409 → 라이브 화면으로 이동)
  const result = useMeetingResult(meetingId, readOnly);

  if (!result.meeting) {
    return (
      <div className={styles.page}>
        <Header />
        {result.hasError ? (
          <div className={styles.loadError}>
            <button
              className={styles.retryButton}
              type="button"
              onClick={result.retry}
            >
              <img src={retry} alt="" />
              결과를 불러오지 못했어요. 다시 시도해주세요.
            </button>
          </div>
        ) : (
          <LoadingView />
        )}
      </div>
    );
  }

  return (
    <ResultContent
      meetingId={meetingId}
      meeting={result.meeting}
      readOnly={readOnly}
      isMock={result.isMock}
    />
  );
};

const ResultContent = ({ meetingId, meeting, readOnly, isMock }) => {
  // 네트워크가 끊기면 본문 대신 로딩 화면을 보여주고, 다시 연결되면 돌아온다.
  const isOnline = useOnlineStatus();
  const [tab, setTab] = useState(RESULT_TABS[0].value);

  // API-11 안건별 3줄 요약 (만드는 중이면 3초마다 다시 확인)
  const summary = useMeetingSummary(meetingId, meeting.agendas, isMock);
  // API-14 회의 내용 (안건별 발화)
  // 참가자 결과 화면은 종료 후 7일이 지나면 회의 내용 탭을 잠근다. (들어올 때 한 번 판단)
  const [isLockPassed] = useState(
    () => !readOnly && isScriptLockPassed(meeting.endedAt, Date.now()),
  );
  const transcripts = useMeetingTranscripts(meetingId, meeting.agendas, {
    isMock,
    isLocked: isLockPassed,
  });
  // 토스트를 새로 띄울 때마다 key를 바꿔 닫히는 시간을 처음부터 센다.
  const [toast, setToast] = useState(null);
  const [scriptHighlight, setScriptHighlight] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // API-13 녹음 (합치는 중이면 3초마다 다시 확인)
  const recording = useMeetingRecording(meetingId, {
    isMock,
    isLocked: isLockPassed,
  });
  // 종료 후 7일이 지났거나, 서버가 녹음·회의 내용을 410으로 막으면 회의 내용 탭을 결제 잠금 창으로 가린다.
  const isScriptLocked =
    transcripts.status === TRANSCRIPTS_STATUS.LOCKED ||
    recording.status === RECORDING_STATUS.EXPIRED;
  const player = useAudioPlayer({
    fallbackDuration: recording.durationSeconds,
    onSourceError: recording.refreshUrl,
  });

  const timeResult = getTimeResult(meeting);

  // API-15 공유 링크 발급
  const shareLink = useShareLink(meetingId, isMock);

  const showToast = (content) =>
    setToast(content ? { ...content, key: Date.now() } : null);
  const closeToast = useCallback(() => setToast(null), []);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(COPIED_TOAST);
    } catch {
      showToast(null);
    }
  };

  const handleCopySummary = () => copyText(getSummaryText(summary.agendas));

  // 누른 안건·발화의 시작 시점으로 녹음을 옮겨 재생한다.
  const handleSelectScript = (target, seconds) => {
    setScriptHighlight(target);
    player.seek(seconds);
    player.play();
  };

  const handleConfirmShare = async () => {
    setIsShareModalOpen(false);
    const result = await shareLink();
    showToast(SHARE_TOASTS[result]);
  };

  const expiryNotice = readOnly && (
    <p className={styles.expiryNotice}>
      공유 링크는 {formatDate(meeting.shareExpiresAt)}까지 볼 수 있어요.
    </p>
  );

  // 녹음이 준비되기 전이나 만들지 못했으면 플레이어 자리에 안내 문구를 보여준다.
  // 잠겼으면 플레이어를 숨긴다.
  const getAudioPlayer = () => {
    if (isScriptLocked) return null;

    if (recording.status !== RECORDING_STATUS.READY) {
      return (
        <p className={styles.playerNotice} role="status">
          {recording.status === RECORDING_STATUS.FAILED
            ? '회의록을 만들지 못했어요.'
            : '회의록을 정리하고 있어요.'}
        </p>
      );
    }

    return (
      <AudioPlayer
        currentTime={player.currentTime}
        duration={player.duration}
        isPlaying={player.isPlaying}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
      />
    );
  };
  const audioPlayer = getAudioPlayer();

  const copyToast = toast && (
    <Toast
      key={toast.key}
      icon={toast.icon}
      message={toast.message}
      onClose={closeToast}
    />
  );

  return (
    <div className={styles.page}>
      <Header>
        {readOnly && <span className={styles.readOnlyBadge}>읽기 전용</span>}
      </Header>
      <audio {...player.audioProps} src={recording.url ?? undefined} />

      {!isOnline ? (
        <LoadingView />
      ) : (
        <>
          <main className={styles.content}>
            <ResultTabs value={tab} onChange={setTab} />
            {tab === 'result' && (
              <MeetingInfoCard meeting={meeting}>
                <TimerRing timeResult={timeResult} />
                <AgendaResultList
                  agendas={meeting.agendas}
                  timeResult={timeResult}
                />
              </MeetingInfoCard>
            )}
            {tab === 'summary' && (
              <SummaryTab
                meeting={meeting}
                agendas={summary.agendas}
                status={summary.status}
                onRetry={summary.retry}
                onCopy={handleCopySummary}
              />
            )}
            {tab === 'script' && (
              <ScriptTab
                meeting={meeting}
                transcripts={transcripts}
                highlight={scriptHighlight}
                isLocked={isScriptLocked}
                onSelect={handleSelectScript}
              />
            )}
            {tab === 'script' && expiryNotice}
          </main>

          {readOnly ? (
            <>
              {tab !== 'script' && expiryNotice}
              {tab === 'script' && (
                <BottomBar header={audioPlayer} floating={copyToast} />
              )}
              {tab !== 'script' && copyToast && (
                <div className={styles.floatingToast}>{copyToast}</div>
              )}
            </>
          ) : (
            <BottomBar
              icon={linkWhite}
              onClick={() => setIsShareModalOpen(true)}
              header={tab === 'script' && audioPlayer}
              floating={copyToast}
            >
              결과 공유하기
            </BottomBar>
          )}
        </>
      )}

      {isShareModalOpen && (
        <ConfirmModal
          title="링크를 공유할까요?"
          description="회의 링크 공유 시 대화 초안과 녹음이 링크를 가진 사람에게 공개돼요."
          confirmLabel="공유"
          onCancel={() => setIsShareModalOpen(false)}
          onConfirm={handleConfirmShare}
        />
      )}
    </div>
  );
};

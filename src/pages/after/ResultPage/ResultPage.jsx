import { useCallback, useState } from 'react';
import { copyCheck, linkWhite } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
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
import { RESULT_TABS, SUMMARY_STATUS } from './constants';
import { getSummaryText } from './getSummaryText';
import { getTimeResult } from './getTimeResult';
import { mockResult } from './mockResult';
import styles from './ResultPage.module.scss';
import { useAudioPlayer } from './useAudioPlayer';

export const ResultPage = () => {
  // TODO: 회의 결과 API 연동 후 URL의 회의 ID로 받아온 값으로 교체
  const meeting = mockResult;
  // 네트워크가 끊기면 본문 대신 로딩 화면을 보여주고, 다시 연결되면 돌아온다.
  const isOnline = useOnlineStatus();
  const [tab, setTab] = useState(RESULT_TABS[0].value);

  const [summaryStatus, setSummaryStatus] = useState(meeting.summaryStatus);
  // 다시 복사하면 토스트를 새로 띄워 닫히는 시간을 처음부터 센다.
  const [copyToastKey, setCopyToastKey] = useState(null);
  const [scriptHighlight, setScriptHighlight] = useState(null);

  const player = useAudioPlayer(meeting.recordingSeconds);

  const timeResult = getTimeResult(meeting.agendas);

  const closeCopyToast = useCallback(() => setCopyToastKey(null), []);

  const handleRetrySummary = () => {
    // TODO: 요약 재생성 API 연동
    setSummaryStatus(SUMMARY_STATUS.PENDING);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyToastKey(Date.now());
    } catch {
      setCopyToastKey(null);
    }
  };

  const handleCopySummary = () => copyText(getSummaryText(meeting.agendas));

  // 누른 안건·발화의 시작 시점으로 녹음을 옮겨 재생한다.
  const handleSelectScript = (target, seconds) => {
    setScriptHighlight(target);
    player.seek(seconds);
    player.play();
  };

  const handleShare = () => {};

  return (
    <div className={styles.page}>
      <Header />
      <audio {...player.audioProps} src={meeting.audioUrl ?? undefined} />

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
                status={summaryStatus}
                onRetry={handleRetrySummary}
                onCopy={handleCopySummary}
              />
            )}
            {tab === 'script' && (
              <ScriptTab
                meeting={meeting}
                highlight={scriptHighlight}
                onSelect={handleSelectScript}
              />
            )}
          </main>

          <BottomBar
            icon={linkWhite}
            onClick={handleShare}
            header={
              tab === 'script' && (
                <AudioPlayer
                  currentTime={player.currentTime}
                  duration={player.duration}
                  isPlaying={player.isPlaying}
                  onTogglePlay={player.togglePlay}
                  onSeek={player.seek}
                />
              )
            }
            floating={
              copyToastKey && (
                <Toast
                  key={copyToastKey}
                  icon={copyCheck}
                  message="복사되었습니다!"
                  onClose={closeCopyToast}
                />
              )
            }
          >
            결과 공유하기
          </BottomBar>
        </>
      )}
    </div>
  );
};

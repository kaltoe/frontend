import { useState } from 'react';
import { linkWhite } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { Header } from '@/components/common/Header/Header';
import { LoadingView } from '@/components/common/LoadingView/LoadingView';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { AgendaResultList } from './components/AgendaResultList';
import { MeetingInfoCard } from './components/MeetingInfoCard';
import { ResultTabs } from './components/ResultTabs';
import { SummaryTab } from './components/SummaryTab';
import { TimerRing } from './components/TimerRing';
import { RESULT_TABS, SUMMARY_STATUS } from './constants';
import { getTimeResult } from './getTimeResult';
import { mockResult } from './mockResult';
import styles from './ResultPage.module.scss';

export const ResultPage = () => {
  // TODO: 회의 결과 API 연동 후 URL의 회의 ID로 받아온 값으로 교체
  const meeting = mockResult;
  // 네트워크가 끊기면 본문 대신 로딩 화면을 보여주고, 다시 연결되면 돌아온다.
  const isOnline = useOnlineStatus();
  const [tab, setTab] = useState(RESULT_TABS[0].value);

  const [summaryStatus, setSummaryStatus] = useState(meeting.summaryStatus);

  const timeResult = getTimeResult(meeting.agendas);

  const handleRetrySummary = () => {
    // TODO: 요약 재생성 API 연동
    setSummaryStatus(SUMMARY_STATUS.PENDING);
  };

  const handleShare = () => {};

  return (
    <div className={styles.page}>
      <Header />

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
              />
            )}
            {tab === 'script' && <MeetingInfoCard meeting={meeting} />}
          </main>

          <BottomBar icon={linkWhite} onClick={handleShare}>
            결과 공유하기
          </BottomBar>
        </>
      )}
    </div>
  );
};

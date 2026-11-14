import { useState } from 'react';
import { linkWhite } from '@/assets';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { Header } from '@/components/common/Header/Header';
import { LoadingView } from '@/components/common/LoadingView/LoadingView';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { MeetingInfoCard } from './components/MeetingInfoCard';
import { ResultTabs } from './components/ResultTabs';
import { RESULT_TABS } from './constants';
import { mockResult } from './mockResult';
import styles from './ResultPage.module.scss';

export const ResultPage = () => {
  // TODO: 회의 결과 API 연동 후 URL의 회의 ID로 받아온 값으로 교체
  const meeting = mockResult;
  // 네트워크가 끊기면 본문 대신 로딩 화면을 보여주고, 다시 연결되면 돌아온다.
  const isOnline = useOnlineStatus();
  const [tab, setTab] = useState(RESULT_TABS[0].value);

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
            <MeetingInfoCard meeting={meeting} />
          </main>

          <BottomBar icon={linkWhite} onClick={handleShare}>
            결과 공유하기
          </BottomBar>
        </>
      )}
    </div>
  );
};

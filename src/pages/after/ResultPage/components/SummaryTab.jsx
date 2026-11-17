import { useState } from 'react';
import { copy, loading, retry } from '@/assets';
import { LoadingView } from '@/components/common/LoadingView/LoadingView';
import { SUMMARY_STATUS } from '../constants';
import { MeetingInfoCard } from './MeetingInfoCard';
import { SummaryItem } from './SummaryItem';
import styles from './SummaryTab.module.scss';

// agendas: 안건마다 summary(요약 줄 목록)를 붙인 목록
// status: API-11 요약 상태. null이면 아직 첫 응답을 받기 전
// onRetry: 없으면(공유 화면) 실패해도 [다시 시도] 대신 안내 문구만 보여준다.
export const SummaryTab = ({ meeting, agendas, status, onRetry, onCopy }) => {
  const [openIds, setOpenIds] = useState(() => [agendas[0]?.id]);

  const toggleItem = (id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  };

  if (status === null) return <LoadingView />;

  if (status === SUMMARY_STATUS.PROCESSING) {
    return (
      <div className={styles.status} role="status">
        <img className={styles.spinner} src={loading} alt="" />
        <div className={styles.statusText}>
          <p className={styles.statusTitle}>AI가 3줄 요약을 만들고 있어요.</p>
          <p className={styles.statusDescription}>약 1분 정도 소요돼요.</p>
        </div>
      </div>
    );
  }

  if (status === SUMMARY_STATUS.FAILED && !onRetry) {
    return (
      <div className={styles.status}>
        <p className={styles.failedText} role="status">
          요약을 만들지 못했어요.
        </p>
      </div>
    );
  }

  if (status === SUMMARY_STATUS.FAILED) {
    return (
      <div className={styles.status}>
        <button className={styles.retryButton} type="button" onClick={onRetry}>
          <img src={retry} alt="" />
          다시 시도해주세요.
        </button>
      </div>
    );
  }

  return (
    <div className={styles.summary}>
      <div className={styles.top}>
        <MeetingInfoCard meeting={meeting} />
        <div className={styles.head}>
          <p className={styles.headText}>
            AI가 안건마다 핵심을 세 줄로 정리했어요.
          </p>
          <button className={styles.copyButton} type="button" onClick={onCopy}>
            <img src={copy} alt="" />
            복사
          </button>
        </div>
      </div>

      <ol className={styles.list}>
        {agendas.map((agenda, index) => (
          <SummaryItem
            key={agenda.id}
            order={index + 1}
            agenda={agenda}
            isOpen={openIds.includes(agenda.id)}
            onToggle={() => toggleItem(agenda.id)}
          />
        ))}
      </ol>
    </div>
  );
};

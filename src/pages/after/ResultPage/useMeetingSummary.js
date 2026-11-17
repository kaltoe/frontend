import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSummary, retrySummary } from '@/api/meeting';
import { goToNoResultAccess } from '@/pages/after/ExpiredLinkPage/expiredLinkReason';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { SUMMARY_STATUS } from './constants';
import { mockResult } from './mockResult';

const POLLING_INTERVAL_MS = 3000;

// 임시 데이터는 안건 순서대로 요약을 붙인다.
const getMockLines = (agendas) =>
  Object.fromEntries(
    agendas.map((agenda, index) => [
      agenda.id,
      mockResult.agendaDetails[index]?.summary ?? [],
    ]),
  );

// API-11 요약 조회. 요약을 만드는 중(PROCESSING)이면 3초마다 다시 부른다.
// status가 null이면 아직 첫 응답을 받기 전이다.
// agendas: API-10 안건 목록. 받은 요약(lines)을 agendaId로 합쳐 summary로 붙인다.
export const useMeetingSummary = (meetingId, agendas, isMock) => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const [status, setStatus] = useState(isMock ? SUMMARY_STATUS.DONE : null);
  const [linesById, setLinesById] = useState(() =>
    isMock ? getMockLines(agendas) : {},
  );
  // [다시 시도](API-12) 요청 중
  const [isRetrying, setIsRetrying] = useState(false);

  // 오프라인이면 멈췄다가 다시 연결되면 이어서 부른다.
  const shouldFetch =
    !isMock &&
    isOnline &&
    (status === null || status === SUMMARY_STATUS.PROCESSING);

  useEffect(() => {
    if (!shouldFetch) return undefined;

    let ignore = false;
    let timerId;

    const load = async () => {
      try {
        const data = await getSummary(meetingId);
        if (ignore) return;

        if (data.status === SUMMARY_STATUS.PROCESSING) {
          setStatus(SUMMARY_STATUS.PROCESSING);
          timerId = setTimeout(load, POLLING_INTERVAL_MS);
          return;
        }

        setLinesById(
          Object.fromEntries(
            data.agendas.map((agenda) => [agenda.agendaId, agenda.lines]),
          ),
        );
        setStatus(data.status);
      } catch (error) {
        if (ignore) return;
        // 결과 화면(API-10)과 같이 토큰이 없거나 만료되면 만료 링크 화면으로
        if (error.response?.status === 401) {
          goToNoResultAccess(navigate);
          return;
        }
        // 네트워크·서버 오류는 잠시 뒤 다시 부른다.
        timerId = setTimeout(load, POLLING_INTERVAL_MS);
      }
    };

    load();

    return () => {
      ignore = true;
      clearTimeout(timerId);
    };
  }, [meetingId, shouldFetch, navigate]);

  // 요약 실패 화면의 [다시 시도] (API-12)
  // 202를 받은 뒤에 PROCESSING으로 바꿔야, 아직 FAILED인 API-11 응답에 다시 확인이 멈추지 않는다.
  const retry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await retrySummary(meetingId);
      setStatus(SUMMARY_STATUS.PROCESSING);
    } catch (error) {
      const code = error.response?.status;
      if (code === 401) {
        goToNoResultAccess(navigate);
      } else if (code === 409) {
        // 이미 다시 만드는 중이거나 FAILED가 아님 → API-11로 지금 상태를 다시 확인
        setStatus(null);
      }
      // 네트워크·서버 오류는 실패 화면을 그대로 두어 다시 누를 수 있게 한다.
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    // 다시 시도 요청 중에는 만드는 중 화면을 보여준다.
    status: isRetrying ? SUMMARY_STATUS.PROCESSING : status,
    retry,
    agendas: agendas.map((agenda) => ({
      ...agenda,
      summary: linesById[agenda.id] ?? [],
    })),
  };
};

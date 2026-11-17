import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSummary } from '@/api/meeting';
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
        // TODO: 401 화면이 정해지면 교체 (기획 문의 중)
        if (error.response?.status === 401) {
          navigate('/invalid-link', { replace: true });
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

  return {
    status,
    agendas: agendas.map((agenda) => ({
      ...agenda,
      summary: linesById[agenda.id] ?? [],
    })),
  };
};

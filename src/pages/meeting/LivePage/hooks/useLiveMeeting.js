import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetingState, pauseMeeting, resumeMeeting } from '@/api/meeting';
import { getMeetingSession } from '@/utils/meetingSession';
import { mockMeeting } from '../mockMeeting';

const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// 목업으로 대기 화면을 볼 때: 주소 뒤에 ?mockStatus=WAITING (&mockRole=MEMBER면 참여자)
const getMockMeeting = () => {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('mockRole') ?? mockMeeting.me.role;
  const me = { ...mockMeeting.me, role };
  const receivedAt = Date.now();

  if (params.get('mockStatus') !== 'WAITING') {
    return { ...mockMeeting, me, timer: { ...mockMeeting.timer, receivedAt } };
  }

  // 대기 중: 안건은 모두 PENDING, 경과 시간 0, currentAgendaId는 시작하면 진행될 첫 안건
  const [firstAgenda] = mockMeeting.agendas;
  return {
    ...mockMeeting,
    me,
    status: 'WAITING',
    transcripts: [],
    agendas: mockMeeting.agendas.map((agenda) => ({
      ...agenda,
      status: 'PENDING',
    })),
    timer: {
      ...mockMeeting.timer,
      status: 'WAITING',
      totalElapsedSeconds: 0,
      currentAgendaId: firstAgenda.agendaId,
      agendaAllocatedSeconds: firstAgenda.allocatedSeconds,
      agendaElapsedSeconds: 0,
      receivedAt,
    },
  };
};

// API-04 응답 + 화면에 필요한 값
const toLiveMeeting = (data, session) => ({
  ...data,
  // API-02 응답에서만 받아서 저장해둔 값 (회의를 만든 진행자만 있음)
  hostRecoveryKey: session?.hostRecoveryKey ?? null,
  partialTranscript: null,
  timer: { ...data.timer, receivedAt: Date.now() },
});

const replaceTimer = (prev, currentTimer, status) => ({
  ...prev,
  status,
  timer: {
    ...prev.timer,
    status,
    totalElapsedSeconds: currentTimer.totalElapsedSeconds,
    agendaElapsedSeconds: currentTimer.agendaElapsedSeconds,
    receivedAt: Date.now(),
  },
});

// 서버가 보낸 timer로 교체 (API-05·06 응답, 이후 WebSocket 이벤트)
const applyServerTimer = (prev, serverTimer) => ({
  ...prev,
  status: serverTimer.status,
  timer: { ...serverTimer, receivedAt: Date.now() },
});

// API-04로 회의 상태를 불러오고, 이후 WebSocket 이벤트의 timer로 스냅샷 교체
export const useLiveMeeting = (meetingId) => {
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(() =>
    USE_MOCK ? getMockMeeting() : null,
  );

  // 연결 상태
  // - 'loading': 처음 불러오는 중 → 로딩 화면
  // - 'connected': 회의 화면
  // - 'reconnecting': 끊겨서 다시 연결 중 → 로딩 화면
  // - 'error': 없는 회의, 서버·네트워크 오류 → 에러 화면
  // TODO: WS-01이 끊기면 'reconnecting'
  const [connection, setConnection] = useState(
    USE_MOCK ? 'connected' : 'loading',
  );

  useEffect(() => {
    if (USE_MOCK) return undefined;

    // 저장된 토큰이 없으면 Sign In부터
    const session = getMeetingSession(meetingId);
    if (!session?.accessToken) {
      navigate(`/m/${meetingId}`, { replace: true });
      return undefined;
    }

    let ignore = false;

    getMeetingState(meetingId)
      .then((data) => {
        if (ignore) return;

        if (data.status === 'ENDED') {
          navigate(`/result/${meetingId}`, { replace: true });
          return;
        }
        setMeeting(toLiveMeeting(data, session));
        setConnection('connected');
      })
      .catch((error) => {
        if (ignore) return;
        // 토큰 만료·다른 회의 토큰 → 저장된 토큰은 instance.js에서 지움. 다시 Sign In
        if (error.response?.status === 401) {
          navigate(`/m/${meetingId}`, { replace: true });
          return;
        }
        setConnection('error');
      });

    return () => {
      ignore = true;
    };
  }, [meetingId, navigate]);

  // 진행자 [회의 시작]
  // TODO: API-19 POST /meetings/{meetingId}/start → 응답 data.timer 적용
  //       409(이미 시작)면 에러 없이 API-04로 다시 불러와 화면만 맞춤
  //       참여자는 WS-01 meeting.started를 받아 같은 처리
  const start = useCallback(() => {
    setMeeting((prev) => {
      const [firstAgenda, ...restAgendas] = prev.agendas;
      return {
        ...replaceTimer(prev, prev.timer, 'IN_PROGRESS'),
        agendas: [{ ...firstAgenda, status: 'IN_PROGRESS' }, ...restAgendas],
      };
    });
  }, []);

  const syncMeeting = useCallback(async () => {
    try {
      const data = await getMeetingState(meetingId);
      if (data.status === 'ENDED') {
        navigate(`/result/${meetingId}`, { replace: true });
        return;
      }
      setMeeting(toLiveMeeting(data, getMeetingSession(meetingId)));
    } catch (error) {
      if (error.response?.status === 401) {
        navigate(`/m/${meetingId}`, { replace: true });
      }
    }
  }, [meetingId, navigate]);

  // 일시 정지 및 재개 요청 중에는 다시 누르지 않게 막음 (여러 번 눌림 방지)
  const isTimerRequestingRef = useRef(false);

  // 누르는 즉시 화면에 반영하고, 서버 응답 timer로 다시 맞춤
  const requestTimerChange = useCallback(
    async (status, currentTimer, request) => {
      if (isTimerRequestingRef.current) return;
      setMeeting((prev) => replaceTimer(prev, currentTimer, status));
      if (USE_MOCK) return;

      isTimerRequestingRef.current = true;
      try {
        const data = await request(meetingId);
        setMeeting((prev) => applyServerTimer(prev, data.timer));
      } catch (error) {
        const errorStatus = error.response?.status;
        if (errorStatus === 401) {
          navigate(`/m/${meetingId}`, { replace: true });
        } else if (errorStatus === 410) {
          navigate(`/result/${meetingId}`, { replace: true });
        } else {
          await syncMeeting();
        }
      } finally {
        isTimerRequestingRef.current = false;
      }
    },
    [meetingId, navigate, syncMeeting],
  );

  // 진행자 [일시 정지] (API-05)
  const pause = useCallback(
    (currentTimer) => requestTimerChange('PAUSED', currentTimer, pauseMeeting),
    [requestTimerChange],
  );

  // 진행자 [재생] (API-06)
  const resume = useCallback(
    (currentTimer) =>
      requestTimerChange('IN_PROGRESS', currentTimer, resumeMeeting),
    [requestTimerChange],
  );

  // TODO: 실제 마이크 켜고 끄기 + WS-01 mic.status 전송
  const toggleMic = useCallback(() => {
    setMeeting((prev) => ({
      ...prev,
      me: { ...prev.me, micState: prev.me.micState === 'ON' ? 'OFF' : 'ON' },
    }));
  }, []);

  // 닫기 버튼, 자동 닫힘
  const closeOfftopic = useCallback(() => {
    setMeeting((prev) => ({ ...prev, activeOfftopicEvent: null }));
  }, []);

  // 관련 있는 이야기에요. → 모든 화면에서 닫힘
  const dismissOfftopic = useCallback(() => {
    setMeeting((prev) => ({ ...prev, activeOfftopicEvent: null }));
  }, []);

  return {
    connection,
    meeting,
    start,
    pause,
    resume,
    toggleMic,
    closeOfftopic,
    dismissOfftopic,
  };
};

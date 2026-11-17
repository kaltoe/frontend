import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  endMeeting,
  getMeetingState,
  nextAgenda,
  pauseMeeting,
  resumeMeeting,
  startMeeting,
} from '@/api/meeting';
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

// 회의 시작 반영 (API-19 응답, 이후 WS-01 meeting.started도 같은 모양)
const applyStart = (prev, timer) => ({
  ...applyServerTimer(prev, timer),
  agendas: prev.agendas.map((agenda) =>
    agenda.agendaId === timer.currentAgendaId
      ? { ...agenda, status: 'IN_PROGRESS' }
      : agenda,
  ),
});

// 대기 중 참여자가 회의 상태를 다시 확인하는 간격 (WS-01 meeting.started 연동 전 임시)
const WAITING_POLL_MS = 3000;

// 안건 전환 결과 반영 (API-07 응답, WS-01 agenda.changed도 같은 모양)
const applyAgendaChange = (prev, { previousAgenda, currentAgenda, timer }) => ({
  ...applyServerTimer(prev, timer),
  agendas: prev.agendas.map((agenda) => {
    if (agenda.agendaId === previousAgenda.agendaId) {
      return {
        ...agenda,
        status: 'DONE',
        actualSeconds: previousAgenda.actualSeconds,
      };
    }
    if (agenda.agendaId === currentAgenda.agendaId) {
      return { ...agenda, status: 'IN_PROGRESS' };
    }
    return agenda;
  }),
  transcripts: [],
  partialTranscript: null,
});

// 목업용(나중에 지움)
const toMockAgendaChange = (prev, currentTimer) => {
  const index = prev.agendas.findIndex(
    (agenda) => agenda.agendaId === currentTimer.currentAgendaId,
  );
  const next = prev.agendas[index + 1];
  return {
    previousAgenda: {
      agendaId: currentTimer.currentAgendaId,
      actualSeconds: currentTimer.agendaElapsedSeconds,
    },
    currentAgenda: next,
    timer: {
      ...prev.timer,
      status: 'IN_PROGRESS',
      totalElapsedSeconds: currentTimer.totalElapsedSeconds,
      currentAgendaId: next.agendaId,
      agendaAllocatedSeconds: next.allocatedSeconds,
      agendaElapsedSeconds: 0,
    },
  };
};

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

  // 진행자 제어(일시 정지·재개·안건 전환) 요청 중에는 다시 누르지 않게 막음 (여러 번 눌림 방지)
  const isControlRequestingRef = useRef(false);

  // 진행자 제어 요청이 실패하면 알림 없이 서버 상태에 맞춤
  // - 401: 토큰 만료 → 참여 페이지
  // - 410 MEETING_ENDED: 끝난 회의 → 결과 화면
  // - 409(이미 정지됨, AGENDA_CHANGED, LAST_AGENDA 등)·그 밖의 오류: API-04로 다시 불러옴
  const handleControlError = useCallback(
    async (error) => {
      const errorStatus = error.response?.status;
      if (errorStatus === 401) {
        navigate(`/m/${meetingId}`, { replace: true });
      } else if (errorStatus === 410) {
        navigate(`/result/${meetingId}`, { replace: true });
      } else {
        await syncMeeting();
      }
    },
    [meetingId, navigate, syncMeeting],
  );

  // 누르는 즉시 화면에 반영하고, 서버 응답 timer로 다시 맞춤
  const requestTimerChange = useCallback(
    async (status, currentTimer, request) => {
      if (isControlRequestingRef.current) return;
      setMeeting((prev) => replaceTimer(prev, currentTimer, status));
      if (USE_MOCK) return;

      isControlRequestingRef.current = true;
      try {
        const data = await request(meetingId);
        setMeeting((prev) => applyServerTimer(prev, data.timer));
      } catch (error) {
        await handleControlError(error);
      } finally {
        isControlRequestingRef.current = false;
      }
    },
    [meetingId, handleControlError],
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

  // 진행자 [다음 안건] → 확인 모달 [전환] (API-07)
  // 끝난 안건의 실제 소요 시간은 서버가 계산하므로 응답을 받은 뒤 반영
  const goToNextAgenda = useCallback(
    async (currentTimer) => {
      if (isControlRequestingRef.current) return;
      if (USE_MOCK) {
        setMeeting((prev) =>
          applyAgendaChange(prev, toMockAgendaChange(prev, currentTimer)),
        );
        return;
      }

      isControlRequestingRef.current = true;
      try {
        const data = await nextAgenda(meetingId, currentTimer.currentAgendaId);
        setMeeting((prev) => applyAgendaChange(prev, data));
      } catch (error) {
        await handleControlError(error);
      } finally {
        isControlRequestingRef.current = false;
      }
    },
    [meetingId, handleControlError],
  );

  // 회의 시작 요청 중 ([회의 시작하기] 버튼을 막음)
  const [isStarting, setIsStarting] = useState(false);

  // 진행자 [회의 시작하기] (API-19)
  // 성공하면 응답 timer로 타이머를 시작. 실패하면 알림 없이 서버 상태에 맞춤
  // (409: 다른 기기에서 먼저 시작 → API-04로 다시 불러와 라이브 화면으로)
  const start = useCallback(async () => {
    if (isControlRequestingRef.current) return;
    if (USE_MOCK) {
      setMeeting((prev) =>
        applyStart(prev, { ...prev.timer, status: 'IN_PROGRESS' }),
      );
      return;
    }

    isControlRequestingRef.current = true;
    setIsStarting(true);
    try {
      const data = await startMeeting(meetingId);
      setMeeting((prev) => applyStart(prev, data.timer));
    } catch (error) {
      await handleControlError(error);
    } finally {
      isControlRequestingRef.current = false;
      setIsStarting(false);
    }
  }, [meetingId, handleControlError]);

  // 대기 중인 참여자: 진행자가 시작했는지 3초마다 확인 (API-04)
  // 시작되면 받은 상태로 라이브 화면이 됨
  // TODO: WS-01 meeting.started를 받으면 이 확인은 지움
  const isWaitingMember =
    meeting?.status === 'WAITING' && meeting.me.role !== 'HOST';
  useEffect(() => {
    if (USE_MOCK || !isWaitingMember) return undefined;
    const id = setInterval(syncMeeting, WAITING_POLL_MS);
    return () => clearInterval(id);
  }, [isWaitingMember, syncMeeting]);

  // 회의 종료 요청 중 (진행자 버튼 모두 막음)
  const [isEnding, setIsEnding] = useState(false);

  // 진행자 [종료] → 확인 모달 [확인] (API-08)
  const end = useCallback(async () => {
    if (isControlRequestingRef.current) return;
    if (USE_MOCK) {
      navigate(`/result/${meetingId}`, { replace: true });
      return;
    }

    isControlRequestingRef.current = true;
    setIsEnding(true);
    try {
      await endMeeting(meetingId);
      navigate(`/result/${meetingId}`, { replace: true });
    } catch (error) {
      setIsEnding(false);
      await handleControlError(error);
    } finally {
      isControlRequestingRef.current = false;
    }
  }, [meetingId, navigate, handleControlError]);

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
    pause,
    resume,
    goToNextAgenda,
    start,
    isStarting,
    end,
    isEnding,
    toggleMic,
    closeOfftopic,
    dismissOfftopic,
  };
};

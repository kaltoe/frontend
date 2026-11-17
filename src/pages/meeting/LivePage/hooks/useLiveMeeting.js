import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  dismissOfftopicEvent,
  endMeeting,
  getMeetingState,
  nextAgenda,
  pauseMeeting,
  resumeMeeting,
  startMeeting,
} from '@/api/meeting';
import { clearMeetingSession, getMeetingSession } from '@/utils/meetingSession';
import { mockMeeting } from '../mockMeeting';
import { useMeetingSocket } from './useMeetingSocket';

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

// 자막은 현재 안건 최근 200개까지
const MAX_TRANSCRIPTS = 200;

// WS-01 transcript.partial: 인식 중인 자막
const applyTranscriptPartial = (prev, partial) => ({
  ...prev,
  partialTranscript: partial,
});

// WS-01 transcript.final: 확정 자막을 목록 끝에 붙이고, 같은 문장의 인식 중 자막은 제거
// - 이전 안건 발화는 붙이지 않음
// - 같은 발화가 두 번 오면 무시
const applyTranscriptFinal = (prev, final) => {
  const isSameSegment = prev.partialTranscript?.segmentKey === final.segmentKey;
  const partialTranscript = isSameSegment ? null : prev.partialTranscript;

  const isOtherAgenda = final.agendaId !== prev.timer.currentAgendaId;
  const isDuplicate = prev.transcripts.some(
    (transcript) => transcript.utteranceId === final.utteranceId,
  );
  if (isOtherAgenda || isDuplicate) return { ...prev, partialTranscript };

  const transcript = {
    utteranceId: final.utteranceId,
    text: final.text,
    offsetMs: final.offsetMs,
    agendaId: final.agendaId,
    participantId: final.participantId,
    speakerName: final.speakerName,
  };
  return {
    ...prev,
    transcripts: [...prev.transcripts, transcript].slice(-MAX_TRANSCRIPTS),
    partialTranscript,
  };
};

// 떠 있는 사담 경고가 같은 이벤트면 닫음
const closeOfftopicEvent = (prev, eventId) =>
  prev.activeOfftopicEvent?.eventId === eventId
    ? { ...prev, activeOfftopicEvent: null }
    : prev;

// 참가자 목록에서 해당 참가자의 정보를 바꿈 (목록에 없으면 추가)
const upsertParticipant = (participants = [], participantId, changes) => {
  const exists = participants.some(
    (participant) => participant.participantId === participantId,
  );
  if (!exists) return [...participants, { participantId, ...changes }];
  return participants.map((participant) =>
    participant.participantId === participantId
      ? { ...participant, ...changes }
      : participant,
  );
};

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

  // WS-01 상태 동기화 (API-04로 처음 불러온 뒤 연결)
  const handleSocketEvent = useCallback(
    ({ type, data }) => {
      switch (type) {
        case 'meeting.started':
          setMeeting((prev) => applyStart(prev, data.timer));
          break;
        case 'meeting.paused':
        case 'meeting.resumed':
        case 'timer.sync': // 진행 중 30초마다 시간 보정
          setMeeting((prev) => applyServerTimer(prev, data.timer));
          break;
        case 'agenda.changed':
          setMeeting((prev) => applyAgendaChange(prev, data));
          break;
        case 'meeting.ended':
          navigate(`/result/${meetingId}`, { replace: true });
          break;

        // 자막
        case 'transcript.partial':
          setMeeting((prev) => applyTranscriptPartial(prev, data));
          break;
        case 'transcript.final':
          setMeeting((prev) => applyTranscriptFinal(prev, data));
          break;
        case 'stt.status': // OK | DELAYED(지연) | NO_AUDIO(음성 미감지)
          setMeeting((prev) => ({ ...prev, sttStatus: data.state }));
          break;

        // 사담
        case 'offtopic.warning': // 전원에게 경고 팝업 (알림음은 eventId가 바뀔 때 한 번)
          setMeeting((prev) => ({ ...prev, activeOfftopicEvent: data }));
          break;
        case 'offtopic.dismissed': // 누군가 "관련 있는 이야기에요."를 누름 → 전원 닫힘
          setMeeting((prev) => closeOfftopicEvent(prev, data.eventId));
          break;
        case 'offtopic.status': // 사담 판정 OK | ERROR
          setMeeting((prev) => ({ ...prev, offtopicStatus: data.state }));
          break;

        // connectedCount: 지금 접속 중인 참가자 수 (같은 사람이 여러 기기로 들어와도 1명)
        case 'participant.joined': // 참가자의 첫 연결 때만 옴
          setMeeting((prev) => ({
            ...prev,
            connectedCount: data.connectedCount,
            participants: upsertParticipant(
              prev.participants,
              data.participantId,
              { name: data.name, role: data.role, isConnected: true },
            ),
          }));
          break;
        case 'participant.left': // 참가자의 마지막 연결이 끊길 때만 옴
          setMeeting((prev) => ({
            ...prev,
            connectedCount: data.connectedCount,
            participants: upsertParticipant(
              prev.participants,
              data.participantId,
              { isConnected: false },
            ),
          }));
          break;
        // 마이크 상태 변경.
        case 'participant.updated':
          setMeeting((prev) => ({
            ...prev,
            participants: upsertParticipant(
              prev.participants,
              data.participantId,
              { micState: data.micState },
            ),
          }));
          break;

        // 녹음 상태: RECORDING | INTERRUPTED | PAUSED
        case 'recording.status':
          setMeeting((prev) => ({ ...prev, recording: data }));
          break;
        default:
          break;
      }
    },
    [meetingId, navigate],
  );

  // 대기 중인지 (소켓 콜백에서 최신 값을 보기 위해 ref로 둠)
  const isWaitingRef = useRef(false);
  useEffect(() => {
    isWaitingRef.current = meeting?.status === 'WAITING';
  });

  // 연결되면 API-04로 상태를 맞춤
  const handleSocketOpen = useCallback(
    async ({ isReconnect }) => {
      if (!isReconnect && !isWaitingRef.current) return;
      await syncMeeting();
      setConnection('connected');
    },
    [syncMeeting],
  );

  // - 4401 토큰 만료: 저장된 토큰을 지우고 참여 페이지 (다시 Sign In)
  // - 4410 회의 종료됨: 결과 화면
  // - 4404 회의 없음: 에러 화면
  // - 그 밖: 로딩 화면
  const handleSocketClose = useCallback(
    ({ code, willReconnect }) => {
      if (code === 4401) {
        clearMeetingSession(meetingId);
        navigate(`/m/${meetingId}`, { replace: true });
      } else if (code === 4410) {
        navigate(`/result/${meetingId}`, { replace: true });
      } else if (code === 4404) {
        setConnection('error');
      } else if (willReconnect) {
        setConnection('reconnecting');
      }
    },
    [meetingId, navigate],
  );

  useMeetingSocket({
    meetingId,
    enabled: !USE_MOCK && meeting !== null,
    onEvent: handleSocketEvent,
    onOpen: handleSocketOpen,
    onClose: handleSocketClose,
  });

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

  // "관련 있는 이야기에요." (API-09) → 모든 화면에서 닫힘
  const dismissOfftopic = useCallback(
    async (eventId) => {
      setMeeting((prev) => closeOfftopicEvent(prev, eventId));
      if (USE_MOCK) return;

      try {
        await dismissOfftopicEvent(meetingId, eventId);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate(`/m/${meetingId}`, { replace: true });
        }
      }
    },
    [meetingId, navigate],
  );

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

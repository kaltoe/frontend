import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranscripts } from '@/api/meeting';
import { goToNoResultAccess } from '@/pages/after/ExpiredLinkPage/expiredLinkReason';
import { mockResult } from './mockResult';

export const TRANSCRIPTS_STATUS = {
  LOADING: 'loading',
  DONE: 'done',
  ERROR: 'error',
  // 보관 기간이 지나 잠김 (410)
  LOCKED: 'locked',
};

// 임시 데이터는 안건 순서대로 발화를 붙인다.
const getMockGroups = (agendas) =>
  agendas.map((agenda, index) => ({
    id: agenda.id,
    title: agenda.title,
    startSeconds: agenda.startSeconds,
    utterances: mockResult.agendaDetails[index]?.utterances ?? [],
  }));

// 잠긴 회의 내용 자리에 흐리게 깔아 둘 글. 실제 기록은 받지 못한다.
// 화면이 비어 보이지 않도록 두 줄로 넘어가는 긴 발화를 안건마다 4개 이상, 모두 합쳐 12개 이상 깐다.
const LOCKED_SPEAKER = '화자 1';
const LOCKED_LINE = '발화내용'.repeat(11);
const LOCKED_MIN_LINES_PER_AGENDA = 4;
const LOCKED_MIN_LINES_TOTAL = 12;
const getLockedGroups = (agendas) => {
  const lineCount = Math.max(
    LOCKED_MIN_LINES_PER_AGENDA,
    Math.ceil(LOCKED_MIN_LINES_TOTAL / Math.max(agendas.length, 1)),
  );
  return agendas.map((agenda) => ({
    id: agenda.id,
    title: agenda.title,
    startSeconds: agenda.startSeconds,
    utterances: Array.from({ length: lineCount }, (_, index) => ({
      id: `${agenda.id}-locked-${index}`,
      startSeconds: (agenda.startSeconds ?? 0) + index * 15,
      speaker: LOCKED_SPEAKER,
      text: LOCKED_LINE,
    })),
  }));
};

// API-14 응답을 회의 내용 탭에서 쓰는 모양으로 바꾼다.
// 안건 위치(startSeconds)는 API-10 안건의 녹음 시작 위치를 쓴다.
const toGroups = (data, agendas) =>
  data.groups.map((group) => ({
    id: group.agendaId,
    title: group.title,
    startSeconds:
      agendas.find((agenda) => agenda.id === group.agendaId)?.startSeconds ??
      null,
    utterances: group.items.map((item) => ({
      id: item.utteranceId,
      startSeconds: item.offsetMs / 1000,
      speaker: item.speakerLabel,
      text: item.text,
    })),
  }));

// API-14 전체 기록 조회. 처음 들어올 때 한 번 부른다.
// 대면 회의의 녹음 후처리(화자 구분)가 끝난 기록은 새로고침하면 받는다.
// agendas: API-10 안건 목록
// isLocked: 종료 후 기간이 지나 잠겼으면 기록을 받지 않고 흐리게 가릴 자리 글만 깔아 둔다.
export const useMeetingTranscripts = (
  meetingId,
  agendas,
  { isMock, isLocked },
) => {
  const navigate = useNavigate();

  const [status, setStatus] = useState(() => {
    if (isLocked) return TRANSCRIPTS_STATUS.LOCKED;
    return isMock ? TRANSCRIPTS_STATUS.DONE : TRANSCRIPTS_STATUS.LOADING;
  });
  const [groups, setGroups] = useState(() => {
    if (isLocked) return getLockedGroups(agendas);
    return isMock ? getMockGroups(agendas) : [];
  });
  // 다시 시도할 때마다 올려서 요청을 다시 보낸다.
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (isMock || isLocked) return undefined;

    let ignore = false;

    getTranscripts(meetingId)
      .then((data) => {
        if (ignore) return;
        setGroups(toGroups(data, agendas));
        setStatus(TRANSCRIPTS_STATUS.DONE);
      })
      .catch((error) => {
        if (ignore) return;
        const code = error.response?.status;
        if (code === 401) {
          goToNoResultAccess(navigate);
          return;
        }
        // 보관 기간이 지남 → 결제 잠금 창
        if (code === 410) {
          setGroups(getLockedGroups(agendas));
          setStatus(TRANSCRIPTS_STATUS.LOCKED);
          return;
        }
        // 네트워크 오류·서버 오류
        setStatus(TRANSCRIPTS_STATUS.ERROR);
      });

    return () => {
      ignore = true;
    };
  }, [meetingId, agendas, isMock, isLocked, navigate, requestKey]);

  const retry = () => {
    setStatus(TRANSCRIPTS_STATUS.LOADING);
    setRequestKey((key) => key + 1);
  };

  return { status, groups, retry };
};

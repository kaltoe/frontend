import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetingResult } from '@/api/meeting';
import { mockResult } from './mockResult';
import { toResultMeeting } from './toResultMeeting';

// 개발 중 VITE_USE_MOCK=true면 서버 없이 임시 데이터로 본다.
const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// API-10 회의 결과 조회
// readOnly(공유 화면)는 API-16 연동 전이라 임시 데이터를 쓴다.
export const useMeetingResult = (meetingId, readOnly) => {
  const navigate = useNavigate();
  const isMock = readOnly || USE_MOCK;

  const [meeting, setMeeting] = useState(() =>
    isMock ? toResultMeeting(mockResult) : null,
  );
  const [hasError, setHasError] = useState(false);
  // 다시 시도할 때마다 올려서 요청을 다시 보낸다.
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (isMock) return undefined;

    let ignore = false;

    getMeetingResult(meetingId)
      .then((data) => {
        if (!ignore) setMeeting(toResultMeeting(data));
      })
      .catch((error) => {
        if (ignore) return;
        const status = error.response?.status;
        // 이 기기에 토큰이 없거나 만료됨. 끝난 회의는 다시 Sign In할 수 없음
        // TODO: 401 화면이 정해지면 교체 (기획 문의 중)
        if (status === 401) {
          navigate('/invalid-link', { replace: true });
          return;
        }
        // 아직 끝나지 않은 회의 → 라이브 화면이 대기·진행 상태를 보여줌
        if (status === 409) {
          navigate(`/meetings/${meetingId}/live`, { replace: true });
          return;
        }
        // 네트워크 오류·서버 오류
        setHasError(true);
      });

    return () => {
      ignore = true;
    };
  }, [meetingId, isMock, navigate, requestKey]);

  const retry = () => {
    setHasError(false);
    setRequestKey((key) => key + 1);
  };

  return { meeting, hasError, retry, isMock };
};

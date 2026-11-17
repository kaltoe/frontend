import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetingResult } from '@/api/meeting';
import { getSharedMeeting } from '@/api/share';
import {
  goToInvalidShareLink,
  goToNoResultAccess,
  isInvalidShareLinkError,
} from '@/pages/after/ExpiredLinkPage/expiredLinkReason';
import { mockResult } from './mockResult';
import { toResultMeeting, toSharedMeeting } from './toResultMeeting';

// 개발 중 VITE_USE_MOCK=true면 서버 없이 임시 데이터로 본다.
const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

const getMockMeeting = () => ({
  ...toResultMeeting(mockResult),
  shareExpiresAt: mockResult.shareExpiresAt,
});

// 결과 화면은 API-10 회의 결과, 공유 화면(readOnly)은 API-16 공유 회의록을 부른다.
// 공유 회의록에는 안건별 3줄 요약(meeting.summary)과 공유 기한(meeting.shareExpiresAt)이 함께 온다.
export const useMeetingResult = ({ meetingId, shareId, readOnly }) => {
  const navigate = useNavigate();
  const isMock = USE_MOCK;

  const [meeting, setMeeting] = useState(() =>
    isMock ? getMockMeeting() : null,
  );
  const [hasError, setHasError] = useState(false);
  // 다시 시도할 때마다 올려서 요청을 다시 보낸다.
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (isMock) return undefined;

    let ignore = false;

    const request = readOnly
      ? getSharedMeeting(shareId).then(toSharedMeeting)
      : getMeetingResult(meetingId).then(toResultMeeting);

    request
      .then((data) => {
        if (!ignore) setMeeting(data);
      })
      .catch((error) => {
        if (ignore) return;
        const status = error.response?.status;
        // 공유 링크가 없거나 만료됨
        if (readOnly && isInvalidShareLinkError(error)) {
          goToInvalidShareLink(navigate);
          return;
        }
        // 이 기기에 토큰이 없거나 만료됨. 끝난 회의는 다시 Sign In할 수 없음
        if (!readOnly && status === 401) {
          goToNoResultAccess(navigate);
          return;
        }
        // 아직 끝나지 않은 회의 → 라이브 화면이 대기·진행 상태를 보여줌
        if (!readOnly && status === 409) {
          navigate(`/meetings/${meetingId}/live`, { replace: true });
          return;
        }
        // 네트워크 오류·서버 오류
        setHasError(true);
      });

    return () => {
      ignore = true;
    };
  }, [meetingId, shareId, readOnly, isMock, navigate, requestKey]);

  const retry = () => {
    setHasError(false);
    setRequestKey((key) => key + 1);
  };

  return { meeting, hasError, retry, isMock };
};

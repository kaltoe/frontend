import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createShareLink } from '@/api/meeting';
import { goToNoResultAccess } from '@/pages/after/ExpiredLinkPage/expiredLinkReason';
import { copyFromPromise } from './copyFromPromise';
import { mockResult } from './mockResult';

export const SHARE_RESULT = {
  COPIED: 'copied',
  // 회의 종료 후 7일이 지나 새 링크를 만들 수 없음 (410 SHARE_EXPIRED)
  EXPIRED: 'expired',
  FAILED: 'failed',
};

// 임시 데이터(VITE_USE_MOCK)로 볼 때는 서버 없이 임시 링크를 복사한다.
const getMockShareUrl = () =>
  `${window.location.origin}/s/${mockResult.shareId}`;

// API-15 공유 링크 발급 후 받은 링크를 복사한다.
// share()는 결과(SHARE_RESULT)를 돌려준다. 복사만 실패하면 null이다.
// 요청 중에 다시 부르면 무시한다.
export const useShareLink = (meetingId, isMock) => {
  const navigate = useNavigate();
  const isSharingRef = useRef(false);

  const requestShareUrl = async () => {
    if (isMock) return getMockShareUrl();
    const data = await createShareLink(meetingId);
    return data.shareUrl;
  };

  const share = async () => {
    if (isSharingRef.current) return null;
    isSharingRef.current = true;

    const urlPromise = requestShareUrl();
    const copyPromise = copyFromPromise(urlPromise);

    try {
      await urlPromise;
    } catch (error) {
      copyPromise.catch(() => {});
      isSharingRef.current = false;
      const status = error.response?.status;
      // 이 기기에 토큰이 없거나 만료됨
      if (status === 401) {
        goToNoResultAccess(navigate);
        return null;
      }
      return status === 410 ? SHARE_RESULT.EXPIRED : SHARE_RESULT.FAILED;
    }

    try {
      await copyPromise;
      return SHARE_RESULT.COPIED;
    } catch {
      return null;
    } finally {
      isSharingRef.current = false;
    }
  };

  return share;
};

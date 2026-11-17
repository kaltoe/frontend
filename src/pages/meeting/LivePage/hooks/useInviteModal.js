import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 팀원 초대 모달 (#21, #22)
// 회의를 만든 진행자는 셋업 화면에서 넘어온 state.openInvite로 처음부터 열림
export const useInviteModal = (isHost) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(
    () => isHost && Boolean(location.state?.openInvite),
  );

  const openInvite = useCallback(() => setIsInviteOpen(true), []);

  // 닫으면 state를 지워서 새로고침해도 다시 열리지 않게 함
  const closeInvite = useCallback(() => {
    setIsInviteOpen(false);

    if (location.state?.openInvite) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  return { isInviteOpen, openInvite, closeInvite };
};

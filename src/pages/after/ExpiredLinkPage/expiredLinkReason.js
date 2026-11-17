// 만료 링크 화면(/invalid-link)을 띄운 이유. navigate의 state.reason으로 넘긴다.
// 넘기지 않으면 공유 링크가 만료되었거나 잘못된 경우로 본다.
export const EXPIRED_LINK_REASON = {
  // 결과 화면에서 이 기기에 토큰이 없거나 만료됨 (401)
  NO_RESULT_ACCESS: 'noResultAccess',
};

// 결과 화면에 접근할 수 없을 때(401) 만료 링크 화면으로 보낸다.
// TODO: 401 화면이 정해지면 교체 (기획 문의 중)
export const goToNoResultAccess = (navigate) =>
  navigate('/invalid-link', {
    replace: true,
    state: { reason: EXPIRED_LINK_REASON.NO_RESULT_ACCESS },
  });

import { useSyncExternalStore } from 'react';

const subscribe = (callback) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

const getSnapshot = () => navigator.onLine;

// 브라우저의 네트워크 연결 여부. 연결이 끊기거나 돌아오면 다시 렌더링된다.
export const useOnlineStatus = () =>
  useSyncExternalStore(subscribe, getSnapshot);

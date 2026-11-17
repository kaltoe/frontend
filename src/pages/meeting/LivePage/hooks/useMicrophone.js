import { useEffect, useRef, useState } from 'react';

// 브라우저 마이크 권한 요청과 오디오 스트림
// - 라이브 화면(대기 화면 포함)에 들어오자마자 권한을 물음 (기획 합의)
// - 권한 결과를 onPermissionChange('granted' | 'denied')로 알려줌
// - 권한이 바뀌면(주소창 사이트 설정 등) 다시 확인
//   · 크롬: Permissions API의 change 이벤트
//   · 아이폰 사파리: change 이벤트가 없을 수 있어서, 화면으로 돌아올 때(visibilitychange) 다시 요청
// - 마이크가 뽑히거나 권한이 회수돼 트랙이 끝나면 'denied'
// 반환: { stream } 음성 송출(WS-02)에 씀. 권한이 없으면 null
const AUDIO_CONSTRAINTS = {
  audio: {
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop());
};

export const useMicrophone = ({ enabled, onPermissionChange }) => {
  const [stream, setStream] = useState(null);

  // 콜백이 바뀌어도 권한을 다시 묻지 않도록 최신 콜백만 ref에 둠
  const onPermissionChangeRef = useRef(onPermissionChange);
  useEffect(() => {
    onPermissionChangeRef.current = onPermissionChange;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    if (!navigator.mediaDevices?.getUserMedia) {
      onPermissionChangeRef.current?.('denied');
      return undefined;
    }

    let current = null;
    let isUnmounted = false;
    let isRequesting = false;

    const deny = () => {
      stopStream(current);
      current = null;
      setStream(null);
      onPermissionChangeRef.current?.('denied');
    };

    const request = async () => {
      if (current || isRequesting) return;
      isRequesting = true;
      try {
        const next =
          await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
        if (isUnmounted) {
          stopStream(next);
          return;
        }
        current = next;
        // 마이크가 뽑히거나 권한이 회수되면 트랙이 끝남
        next.getAudioTracks().forEach((track) => {
          track.addEventListener('ended', deny);
        });
        setStream(next);
        onPermissionChangeRef.current?.('granted');
      } catch {
        // NotAllowedError(거부), NotFoundError(마이크 없음) 등
        if (!isUnmounted) deny();
      } finally {
        isRequesting = false;
      }
    };

    request();

    // 크롬 등: 권한 설정이 바뀌면 바로 반영
    let permissionStatus = null;
    const handlePermissionChange = () => {
      if (permissionStatus?.state === 'granted') request();
      else if (permissionStatus?.state === 'denied') deny();
    };
    navigator.permissions
      ?.query({ name: 'microphone' })
      .then((status) => {
        if (isUnmounted) return;
        permissionStatus = status;
        status.addEventListener('change', handlePermissionChange);
      })
      .catch(() => {
        // 사파리 일부 버전은 microphone 조회를 지원하지 않음
      });

    // 설정 앱 등에서 허용하고 돌아왔을 때 다시 요청
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !current) request();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isUnmounted = true;
      stopStream(current);
      permissionStatus?.removeEventListener('change', handlePermissionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  return { stream };
};

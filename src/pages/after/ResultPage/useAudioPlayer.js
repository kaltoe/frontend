import { useRef, useState } from 'react';

// 녹음 재생 상태. audioProps는 <audio> 요소에 그대로 넘긴다.
// 녹음 길이를 알기 전에는 fallbackDuration(초)을 전체 길이로 보여준다.
// onSourceError: 녹음 주소를 불러오지 못했을 때(주소 만료·403 등). 새 주소로 바뀌면 같은 위치부터 이어 재생한다.
export const useAudioPlayer = ({ fallbackDuration, onSourceError }) => {
  const audioRef = useRef(null);
  // 주소가 바뀐 뒤 이어 갈 위치와 재생 여부
  const resumeRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const duration = loadedDuration ?? fallbackDuration ?? 0;

  // 녹음 주소가 없으면 play()가 끝나지 않고 기다리기만 해서 재생 상태가 꼬인다.
  const play = () => {
    const audio = audioRef.current;
    if (!audio?.getAttribute('src')) return;
    audio.play().catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else play();
  };

  const seek = (seconds) => {
    setCurrentTime(seconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
  };

  const audioProps = {
    ref: audioRef,
    onLoadedMetadata: (event) => {
      const audio = event.currentTarget;
      setLoadedDuration(audio.duration);

      const resume = resumeRef.current;
      if (!resume) return;
      resumeRef.current = null;
      audio.currentTime = resume.time;
      if (resume.isPlaying) audio.play().catch(() => setIsPlaying(false));
    },
    onTimeUpdate: (event) => setCurrentTime(event.currentTarget.currentTime),
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: () => setIsPlaying(false),
    onError: (event) => {
      if (!event.currentTarget.getAttribute('src')) return;
      resumeRef.current = { time: currentTime, isPlaying };
      setIsPlaying(false);
      onSourceError?.();
    },
  };

  return {
    currentTime,
    duration,
    isPlaying,
    play,
    togglePlay,
    seek,
    audioProps,
  };
};

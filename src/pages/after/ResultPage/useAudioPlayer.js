import { useRef, useState } from 'react';

// 녹음 재생 상태. audioProps는 <audio> 요소에 그대로 넘긴다.
// 녹음 길이를 알기 전에는 fallbackDuration(초)을 전체 길이로 보여준다.
export const useAudioPlayer = (fallbackDuration) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [isPlaying, setIsPlaying] = useState(false);

  // 녹음 주소가 없으면 play()가 끝나지 않고 기다리기만 해서 재생 상태가 꼬인다.
  const play = () => {
    const audio = audioRef.current;
    if (!audio?.src) return;
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
    onLoadedMetadata: (event) => setDuration(event.currentTarget.duration),
    onTimeUpdate: (event) => setCurrentTime(event.currentTarget.currentTime),
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: () => setIsPlaying(false),
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

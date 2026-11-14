const ALERT_TONES = {
  timeUp: [
    { frequency: 880, start: 0, duration: 0.15 },
    { frequency: 880, start: 0.25, duration: 0.15 },
    { frequency: 880, start: 0.5, duration: 0.15 },
  ],
  offtopic: [
    { frequency: 988, start: 0, duration: 0.12 },
    { frequency: 740, start: 0.16, duration: 0.2 },
  ],
};

const VOLUME = 0.3;

let audioContext = null;

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext = new AudioContextClass();
  return audioContext;
};

// 첫 터치, 키 입력 시 오디오 설정
export const unlockMeetingAlert = () => {
  const context = getAudioContext();
  if (context?.state === 'suspended') context.resume().catch(() => {});
};

// type: 'timeUp' | 'offtopic'
export const playMeetingAlert = (type) => {
  const tones = ALERT_TONES[type];
  const context = getAudioContext();
  if (!tones || !context || context.state !== 'running') return;

  const now = context.currentTime;
  tones.forEach(({ frequency, start, duration }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const begin = now + start;
    gain.gain.setValueAtTime(0, begin);
    gain.gain.linearRampToValueAtTime(VOLUME, begin + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(begin);
    oscillator.stop(begin + duration + 0.02);
  });
};

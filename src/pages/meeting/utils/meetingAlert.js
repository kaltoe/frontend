import { meetingSoundOfftopic, meetingSoundTimeUp } from '@/assets';

const ALERT_SOUNDS = {
  timeUp: meetingSoundTimeUp,
  offtopic: meetingSoundOfftopic,
};

// 0~1. 파일 자체 음량을 그대로 쓰려면 1
const VOLUME = 1;

let audioContext = null;
// type별로 한 번만 불러와서 재사용
const bufferPromises = {};

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext = new AudioContextClass();
  return audioContext;
};

const loadSound = (type) => {
  const context = getAudioContext();
  if (!context || !ALERT_SOUNDS[type]) return Promise.resolve(null);
  if (!bufferPromises[type]) {
    bufferPromises[type] = fetch(ALERT_SOUNDS[type])
      .then((response) => response.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .catch(() => {
        delete bufferPromises[type];
        return null;
      });
  }
  return bufferPromises[type];
};

// 첫 터치, 키 입력 시 오디오 설정 + 소리 파일 미리 불러오기
export const unlockMeetingAlert = () => {
  const context = getAudioContext();
  if (context?.state === 'suspended') context.resume().catch(() => {});
  Object.keys(ALERT_SOUNDS).forEach(loadSound);
};

// type: 'timeUp' | 'offtopic'
export const playMeetingAlert = async (type) => {
  const context = getAudioContext();
  if (!context || context.state !== 'running') return;

  const buffer = await loadSound(type);
  if (!buffer) return;

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = VOLUME;
  source.connect(gain).connect(context.destination);
  source.start();
};

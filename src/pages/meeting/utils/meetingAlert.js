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

// 알림음 깨우기 + 소리 파일 미리 불러오기
// 브라우저(특히 아이폰 사파리)는 사용자가 누르는 순간 실행된 코드에서만 소리를 허용함
// → 라이브 화면으로 들어가는 버튼의 onClick 안에서 바로 호출해야 함 (await 뒤나 setTimeout 안 X)
//   예: 회의 만들기·[회의 시작하기]·회의 참여 버튼
//   import { unlockMeetingAlert } from '@/pages/meeting/utils/meetingAlert';
//   onClick={() => { unlockMeetingAlert(); ... }}
// 라이브 화면에서도 첫 터치·키 입력 때 한 번 더 호출함 (새로고침 대비)
export const unlockMeetingAlert = () => {
  const context = getAudioContext();
  if (!context) return;

  // 'suspended'(아직 안 깨움) 또는 'interrupted'(아이폰 전화 등으로 끊김)
  if (context.state !== 'running') {
    context.resume().catch(() => {});
    // 아이폰 일부 버전은 resume만으로 안 깨서, 누르는 순간 무음을 아주 짧게 재생
    const silent = context.createBuffer(1, 1, context.sampleRate);
    const source = context.createBufferSource();
    source.buffer = silent;
    source.connect(context.destination);
    source.start(0);
  }

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

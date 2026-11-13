// 아이콘 및 이미지 파일들을 한 곳에서 관리하기 위한 인덱스 파일(Barrel export)
// 1. 화면별 폴더(meeting 등)에 파일 추가
// 2. 여기서 import 후 아래 export에 이름 추가
// 사용: import { meetingIconCaption } from '@/assets';

// 회의 라이브 화면
import meetingDotDanger from './meeting/dot-danger.svg';
import meetingDotWarning from './meeting/dot-warning.svg';
import meetingIconCaption from './meeting/icon-caption.svg';
import meetingIconChatWarning from './meeting/icon-chat-warning.svg';
import meetingIconChevron from './meeting/icon-chevron.svg';
import meetingIconCloseSmall from './meeting/icon-close-small.svg';
import meetingIconMicOffBody from './meeting/icon-mic-off-body.svg';
import meetingIconMicOffSlash from './meeting/icon-mic-off-slash.svg';
import meetingIconMicOffSmall from './meeting/icon-mic-off-small.svg';
import meetingIconMicOn from './meeting/icon-mic-on.svg';

export {
  meetingDotDanger,
  meetingDotWarning,
  meetingIconCaption,
  meetingIconChatWarning,
  meetingIconChevron,
  meetingIconCloseSmall,
  meetingIconMicOffBody,
  meetingIconMicOffSlash,
  meetingIconMicOffSmall,
  meetingIconMicOn,
};

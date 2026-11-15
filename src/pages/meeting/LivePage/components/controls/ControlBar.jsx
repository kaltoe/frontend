import {
  meetingControlMicDisabled,
  meetingControlMicOffBody,
  meetingControlMicOffSlash,
  meetingControlMicOn,
  meetingControlNext,
  meetingControlNextDisabled,
  meetingControlPause,
  meetingControlPauseDisabled,
  meetingControlPlay,
} from '@/assets';
import styles from './ControlBar.module.scss';

const MicIcon = ({ isOn, disabled }) => {
  if (disabled) {
    return (
      <img src={meetingControlMicDisabled} alt="" width={22} height={22} />
    );
  }
  if (isOn) {
    return <img src={meetingControlMicOn} alt="" width={22} height={22} />;
  }
  return (
    <span className={styles.micOff}>
      <img
        className={styles.micOffBody}
        src={meetingControlMicOffBody}
        alt=""
      />
      <img
        className={styles.micOffSlash}
        src={meetingControlMicOffSlash}
        alt=""
      />
    </span>
  );
};

const getPauseIcon = (isPaused, disabled) => {
  if (disabled) return meetingControlPauseDisabled;
  return isPaused ? meetingControlPlay : meetingControlPause;
};

// 하단 컨트롤 바
// 진행자: 모두 사용 가능
// 참여자: 대면이면 모두 비활성화, 비대면이면 마이크만
export const ControlBar = ({
  isHost,
  isMicOn,
  canUseMic,
  isPaused,
  isLastAgenda,
  onMicToggle,
  onPauseToggle,
  onNext,
  onEnd,
}) => {
  const isPauseDisabled = !isHost;
  const isNextDisabled = !isHost || isLastAgenda;
  const isEndDisabled = !isHost;

  return (
    <nav className={styles.bar} aria-label="회의 진행 버튼">
      <button
        type="button"
        className={`${styles.round} ${styles.mic}`}
        onClick={onMicToggle}
        disabled={!canUseMic}
        aria-label={isMicOn ? '마이크 끄기' : '마이크 켜기'}
        aria-pressed={isMicOn}
      >
        <MicIcon isOn={isMicOn} disabled={!canUseMic} />
      </button>

      <button
        type="button"
        className={`${styles.round} ${styles.pause}`}
        onClick={onPauseToggle}
        disabled={isPauseDisabled}
        aria-label={isPaused ? '회의 재개' : '일시 정지'}
      >
        <img
          src={getPauseIcon(isPaused, isPauseDisabled)}
          alt=""
          width={20}
          height={20}
        />
      </button>

      <button
        type="button"
        className={styles.next}
        onClick={onNext}
        disabled={isNextDisabled}
      >
        <img
          src={isNextDisabled ? meetingControlNextDisabled : meetingControlNext}
          alt=""
          width={24}
          height={24}
        />
        다음 안건
      </button>

      <button
        type="button"
        className={styles.end}
        onClick={onEnd}
        disabled={isEndDisabled}
      >
        종료
      </button>
    </nav>
  );
};

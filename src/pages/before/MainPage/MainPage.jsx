import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  bellRing,
  enter,
  featureSummary,
  featureTime,
  link,
  loading,
  logoRun,
  plusGray,
  plusWhite,
  trialDotFilled,
  trialDotOutline,
  trialLine,
} from '@/assets';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { extractMeetingCode } from './extractMeetingCode';
import styles from './MainPage.module.scss';

const TRIAL_STEPS = [
  { title: '오늘', description: '모든 기능 무료', dot: trialDotFilled },
  { title: '+ 7일', description: '회의 내용 잠금', dot: trialDotOutline },
  { title: '결제하면', description: '다시 볼 수 있어요', dot: trialDotOutline },
];

export const MainPage = () => {
  const navigate = useNavigate();
  // 네트워크가 끊기면 본문 대신 로딩 화면을 보여주고, 다시 연결되면 돌아온다.
  const isOnline = useOnlineStatus();
  const isLoading = !isOnline;
  const [codeInput, setCodeInput] = useState('');
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);

  const handleCreateMeeting = () => {
    navigate('/setup');
  };

  const handleJoin = (event) => {
    event.preventDefault();
    const code = extractMeetingCode(codeInput);
    if (!code) {
      setIsCodeInvalid(true);
      return;
    }
    navigate(`/m/${code}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src={logoRun} alt="" />
          <span className={styles.logoText}>칼퇴</span>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loading} role="status">
          <img className={styles.spinner} src={loading} alt="" />
          <p className={styles.loadingText}>로딩 중...</p>
        </div>
      ) : (
        <main className={styles.content}>
          <section className={styles.intro}>
            <div className={styles.introTop}>
              <div className={styles.headline}>
                <h1 className={styles.title}>
                  회의를 스마트하게{' '}
                  <span className={styles.highlight}>끝내는</span> 법.
                </h1>
                <p className={styles.description}>
                  안건마다 시간을 나누고, 주제에서 벗어나면 AI가 알려줘요.
                  <br />
                  끝나면 3줄 요약 회의록까지 정리돼요.
                </p>
              </div>

              <div className={styles.featureBlock}>
                <ul className={styles.featureCard}>
                  <li className={styles.feature}>
                    <img src={featureTime} alt="" />
                    <span className={styles.featureLabel}>시간 분배</span>
                  </li>
                  <li className={styles.feature}>
                    <div className={styles.alertVisual}>
                      <span className={styles.bar} />
                      <span className={`${styles.bar} ${styles.barShort}`} />
                      <span className={styles.alert}>
                        <img src={bellRing} alt="" />
                      </span>
                    </div>
                    <span className={styles.featureLabel}>AI 알림</span>
                  </li>
                  <li className={styles.feature}>
                    <img src={featureSummary} alt="" />
                    <span className={styles.featureLabel}>3줄 요약</span>
                  </li>
                </ul>
                <p className={styles.trialTitle}>무료 체험 안내</p>
              </div>
            </div>

            <div className={styles.trial}>
              <div className={styles.trialLine}>
                <img src={trialLine} alt="" />
              </div>
              <ol className={styles.trialSteps}>
                {TRIAL_STEPS.map((step) => (
                  <li key={step.title} className={styles.trialStep}>
                    <img src={step.dot} alt="" />
                    <div className={styles.trialText}>
                      <strong className={styles.trialStepTitle}>
                        {step.title}
                      </strong>
                      <span className={styles.trialStepDescription}>
                        {step.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className={styles.join}>
            <div className={styles.joinBody}>
              <div className={styles.joinHeading}>
                <h2 className={styles.joinTitle}>초대받았나요?</h2>
                <p className={styles.joinDescription}>
                  받은 링크나 코드로 바로 참여해요.
                </p>
              </div>
              <form className={styles.joinForm} onSubmit={handleJoin}>
                <label className={styles.joinField}>
                  <img src={link} alt="" />
                  <input
                    className={styles.joinInput}
                    type="text"
                    value={codeInput}
                    onChange={(event) => {
                      setCodeInput(event.target.value);
                      setIsCodeInvalid(false);
                    }}
                    aria-invalid={isCodeInvalid}
                    placeholder="회의 링크 또는 코드 입력"
                    aria-label="회의 링크 또는 코드"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
                </label>
                <button
                  className={styles.joinButton}
                  type="submit"
                  aria-label="참여"
                >
                  <img src={enter} alt="" />
                </button>
              </form>
            </div>
            {isCodeInvalid ? (
              <p
                className={`${styles.joinExample} ${styles.joinError}`}
                role="alert"
              >
                회의 링크나 6자리 코드를 확인해주세요.
              </p>
            ) : (
              <p className={styles.joinExample}>예: K7Q2MX</p>
            )}
          </section>
        </main>
      )}

      <footer className={styles.bottomBar}>
        <button
          className={styles.createButton}
          type="button"
          onClick={handleCreateMeeting}
          disabled={isLoading}
        >
          <img src={isLoading ? plusGray : plusWhite} alt="" />
          <span className={styles.createButtonText}>회의 만들기</span>
        </button>
      </footer>
    </div>
  );
};

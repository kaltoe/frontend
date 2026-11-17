import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEntryInfo, signIn } from '@/api/meeting';
import { infoGray, joinGray, joinWhite, lock, people, person } from '@/assets';
import { BackHeader } from '@/components/common/BackHeader/BackHeader';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { FieldLabel } from '@/components/common/FieldLabel/FieldLabel';
import { LoadingView } from '@/components/common/LoadingView/LoadingView';
import { unlockMeetingAlert } from '@/pages/meeting/LivePage/utils/meetingAlert';
import { saveMeetingSession } from '@/utils/meetingSession';
import { IconInput } from './components/IconInput';
import { RecoveryKeyField } from './components/RecoveryKeyField';
import { NAME_MAX_LENGTH, PASSWORD_LENGTH } from './constants';
import { getSignInErrorMessage } from './getSignInErrorMessage';
import styles from './JoinPage.module.scss';

// 진행자 복구 키가 있으면 이름·비밀번호는 보내지 않음 (서버도 보지 않음)
const toSignInBody = ({ name, password, recoveryKey }) => {
  const hostRecoveryKey = recoveryKey.trim().toUpperCase();
  if (hostRecoveryKey) return { hostRecoveryKey };
  return password ? { name: name.trim(), password } : { name: name.trim() };
};

export const JoinPage = () => {
  const navigate = useNavigate();
  // 링크 코드는 대문자 6자리 (API-01 비고)
  const meetingId = (useParams().code ?? '').toUpperCase();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 서버가 거절한 이유. 그때 보낸 body와 같을 때만 보여준다 (입력을 고치면 사라짐)
  const [requestError, setRequestError] = useState(null);

  // API-01 회의 입장 정보 (제목, 지금 접속 중인 인원)
  const [meeting, setMeeting] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let ignore = false;

    getEntryInfo(meetingId)
      .then((data) => {
        if (!ignore) setMeeting(data);
      })
      .catch((error) => {
        if (ignore) return;
        // 없는 회의(404), 끝났거나 만료된 회의(410)는 만료 링크 화면으로
        const status = error.response?.status;
        if (status === 404 || status === 410) {
          navigate('/invalid-link', { replace: true });
          return;
        }
        // 네트워크 오류·요청 과다(429)
        setLoadError(getSignInErrorMessage(error));
      });

    return () => {
      ignore = true;
    };
  }, [meetingId, navigate]);

  const isNameEmpty = name.trim().length === 0;
  const isNameTooLong = name.length > NAME_MAX_LENGTH;
  // 비밀번호는 선택. 입력했다면 숫자 4자리를 다 채워야 함
  const isPasswordIncomplete =
    password.length > 0 && password.length < PASSWORD_LENGTH;
  const canJoin =
    !isNameEmpty && !isNameTooLong && !isPasswordIncomplete && !isSubmitting;

  const body = toSignInBody({ name, password, recoveryKey });
  const bodyKey = JSON.stringify(body);
  const visibleRequestError =
    requestError?.bodyKey === bodyKey ? requestError.message : null;

  const notice = isNameEmpty
    ? '이름을 입력해주세요.'
    : isPasswordIncomplete
      ? `비밀번호는 숫자 ${PASSWORD_LENGTH}자리로 입력해주세요.`
      : visibleRequestError;

  const handleJoin = async () => {
    // 라이브 화면 알림음(#23, #35)을 누르는 순간 미리 깨움
    // 아이폰 사파리 때문에 API 호출(await)보다 먼저 실행해야 함
    unlockMeetingAlert();

    if (!canJoin) return;
    setIsSubmitting(true);
    setRequestError(null);

    try {
      const signedIn = await signIn(meetingId, body);
      saveMeetingSession(meetingId, {
        accessToken: signedIn.accessToken,
        // 진행자로 복구했으면 초대 모달에서 다시 보여줄 수 있게 함께 저장
        ...(body.hostRecoveryKey && {
          hostRecoveryKey: body.hostRecoveryKey,
        }),
      });
      // 회의가 대기(WAITING) 중이면 라이브 화면이 API-04 상태를 보고 대기 화면을 보여줌
      // 참여자·진행자 복구 모두 openInvite는 넘기지 않음 (초대 모달 자동 열림은 회의를 만든 진행자만)
      navigate(`/meetings/${meetingId}/live`, { replace: true });
    } catch (error) {
      setRequestError({ bodyKey, message: getSignInErrorMessage(error) });
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(
      event.target.value.replace(/\D/g, '').slice(0, PASSWORD_LENGTH),
    );
  };

  // 회의 정보를 불러오는 중이거나 불러오지 못했을 때
  if (!meeting) {
    return (
      <div className={styles.page}>
        <BackHeader title="회의 입장하기" />
        <main className={`${styles.content} ${styles.statusContent}`}>
          {loadError ? (
            <p className={styles.loadError} role="alert">
              {loadError}
            </p>
          ) : (
            <LoadingView />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <BackHeader title="회의 입장하기" />

      <main className={styles.content}>
        <div className={styles.headline}>
          <div className={styles.headlineText}>
            <h1 className={styles.title}>{meeting.title}</h1>
            <p className={styles.description}>
              이름을 입력하고 회의에 참여해요.
            </p>
          </div>
          <div className={styles.participants}>
            <img src={people} alt="" />
            <span>{meeting.connectedCount}명 참여</span>
          </div>
        </div>

        <div className={styles.form}>
          <section className={styles.field}>
            <FieldLabel htmlFor="join-name" required>
              이름
            </FieldLabel>
            <div className={styles.inputGroup}>
              <IconInput
                id="join-name"
                icon={person}
                isError={isNameTooLong}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력해주세요."
              />
              <p
                className={`${styles.counter} ${isNameTooLong ? styles.counterError : ''}`}
              >
                {name.length}/{NAME_MAX_LENGTH}
              </p>
            </div>
          </section>

          <section className={styles.field}>
            <FieldLabel htmlFor="join-password">비밀번호</FieldLabel>
            <div className={styles.inputGroup}>
              <IconInput
                id="join-password"
                icon={lock}
                type="password"
                inputMode="numeric"
                maxLength={PASSWORD_LENGTH}
                value={password}
                onChange={handlePasswordChange}
                placeholder={`숫자 ${PASSWORD_LENGTH}자리`}
              />
              <p className={styles.hint}>
                비밀번호를 입력하면 재입장 시 같은 이름으로 이어져요.
              </p>
            </div>
          </section>
        </div>

        <RecoveryKeyField value={recoveryKey} onChange={setRecoveryKey} />

        <div className={styles.note}>
          <img className={styles.noteIcon} src={infoGray} alt="" />
          <p>
            이름과 비밀번호는 이 회의에서만 사용돼요.
            <br />
            처음이라면 새 비밀번호를 정하고, 다시 들어온다면 같은 이름과
            비밀번호를 입력해주세요.
          </p>
        </div>
      </main>

      <BottomBar
        icon={canJoin ? joinWhite : joinGray}
        onClick={handleJoin}
        disabled={!canJoin}
        notice={notice ?? undefined}
        noticeType={notice === visibleRequestError ? 'danger' : 'info'}
      >
        {isSubmitting ? '입장하는 중…' : '회의 입장하기'}
      </BottomBar>
    </div>
  );
};

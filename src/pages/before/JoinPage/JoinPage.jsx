import { useState } from 'react';
import { infoGray, joinGray, joinWhite, lock, people, person } from '@/assets';
import { BackHeader } from '@/components/common/BackHeader/BackHeader';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { FieldLabel } from '@/components/common/FieldLabel/FieldLabel';
import { IconInput } from './components/IconInput';
import { RecoveryKeyField } from './components/RecoveryKeyField';
import { NAME_MAX_LENGTH, PASSWORD_LENGTH } from './constants';
import styles from './JoinPage.module.scss';

// TODO: 회의 조회 API 연동 후 링크 코드(useParams의 code)로 받아온 값으로 교체
const meeting = { title: '회의 제목', participantCount: 3 };

export const JoinPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');

  const isNameEmpty = name.trim().length === 0;
  const isNameTooLong = name.length > NAME_MAX_LENGTH;
  const canJoin =
    !isNameEmpty && !isNameTooLong && password.length === PASSWORD_LENGTH;

  const handleJoin = () => {
    // TODO: 회의 입장 API 연동 (recoveryKey가 있으면 진행자로 입장)
  };

  const handlePasswordChange = (event) => {
    setPassword(
      event.target.value.replace(/\D/g, '').slice(0, PASSWORD_LENGTH),
    );
  };

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
            <span>{meeting.participantCount}명 참여</span>
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
        notice={isNameEmpty ? '이름을 입력해주세요.' : undefined}
      >
        회의 입장하기
      </BottomBar>
    </div>
  );
};

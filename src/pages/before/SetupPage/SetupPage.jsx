import { useState } from 'react';
import { playGray } from '@/assets';
import { BackHeader } from '@/components/common/BackHeader/BackHeader';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { FieldLabel } from './components/FieldLabel';
import {
  MEETING_TYPES,
  PARTICIPANTS_MAX,
  PARTICIPANTS_MIN,
  TITLE_MAX_LENGTH,
} from './constants';
import styles from './SetupPage.module.scss';

export const SetupPage = () => {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0].value);
  const [participants, setParticipants] = useState('');

  const isTitleTooLong = title.length > TITLE_MAX_LENGTH;

  const handleParticipantsChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '');
    if (!digits) {
      setParticipants('');
      return;
    }
    setParticipants(String(Math.min(Number(digits), PARTICIPANTS_MAX)));
  };

  const handleParticipantsBlur = () => {
    if (participants && Number(participants) < PARTICIPANTS_MIN) {
      setParticipants(String(PARTICIPANTS_MIN));
    }
  };

  return (
    <div className={styles.page}>
      <BackHeader title="회의 만들기" />

      <main className={styles.content}>
        <div className={styles.headline}>
          <h1 className={styles.title}>어떤 회의를 할까요?</h1>
          <p className={styles.description}>
            제목과 안건, 목표 시간을 정해주세요.
          </p>
        </div>

        <div className={styles.form}>
          <section className={styles.field}>
            <FieldLabel htmlFor="meeting-title" required>
              회의 제목
            </FieldLabel>
            <div className={styles.titleField}>
              <input
                id="meeting-title"
                className={`${styles.input} ${isTitleTooLong ? styles.inputError : ''}`}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="회의 제목을 입력하세요."
                autoComplete="off"
              />
              <p
                className={`${styles.counter} ${isTitleTooLong ? styles.errorText : ''}`}
              >
                {title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>
          </section>

          <section className={styles.field}>
            <div className={styles.typeRow}>
              <div className={styles.typeField}>
                <FieldLabel required>회의 방식</FieldLabel>
                <div className={styles.chips} role="radiogroup">
                  {MEETING_TYPES.map((type) => (
                    <button
                      key={type.value}
                      className={`${styles.chip} ${meetingType === type.value ? styles.chipSelected : ''}`}
                      type="button"
                      role="radio"
                      aria-checked={meetingType === type.value}
                      onClick={() => setMeetingType(type.value)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.participantsField}>
                <FieldLabel htmlFor="meeting-participants">
                  참석 인원
                </FieldLabel>
                <label className={styles.participantsBox}>
                  <input
                    id="meeting-participants"
                    className={styles.participantsInput}
                    type="text"
                    inputMode="numeric"
                    value={participants}
                    onChange={handleParticipantsChange}
                    onBlur={handleParticipantsBlur}
                    placeholder={`${PARTICIPANTS_MIN}~${PARTICIPANTS_MAX}`}
                    autoComplete="off"
                  />
                  <span className={styles.participantsUnit}>명</span>
                </label>
              </div>
            </div>
            {meetingType === 'offline' && (
              <p className={styles.hint}>
                대면 회의는 진행자의 마이크로만 녹음해요.
              </p>
            )}
          </section>
        </div>
      </main>

      <BottomBar icon={playGray} disabled>
        회의 시작하기
      </BottomBar>
    </div>
  );
};

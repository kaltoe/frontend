import { useEffect, useState } from 'react';
import { playGray, playWhite } from '@/assets';
import { BackHeader } from '@/components/common/BackHeader/BackHeader';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import { FieldLabel } from '@/components/common/FieldLabel/FieldLabel';
import { AgendaCard } from './components/AgendaCard';
import { AgendaForm } from './components/AgendaForm';
import { ConsentCheck } from './components/ConsentCheck';
import { TargetTimeSlider } from './components/TargetTimeSlider';
import {
  AGENDA_DEFAULT_MINUTES,
  MEETING_TYPES,
  PARTICIPANTS_MAX,
  PARTICIPANTS_MIN,
  TITLE_MAX_LENGTH,
} from './constants';
import { getStartBlocker } from './getStartBlocker';
import styles from './SetupPage.module.scss';
import { useDragSort } from './useDragSort';

export const SetupPage = () => {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0].value);
  const [participants, setParticipants] = useState('');
  const [targetTime, setTargetTime] = useState(null);
  const [agendas, setAgendas] = useState([]);
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!event.target.closest('[data-agenda-card]')) setSelectedId(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const isTitleTooLong = title.length > TITLE_MAX_LENGTH;
  const startBlocker = getStartBlocker({ title, agendas, targetTime, agreed });
  const canStart = !startBlocker;

  const handleStart = () => {
    // TODO: 회의 생성 API 연동 후 생성된 회의 화면으로 이동
  };

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

  const { draggingId, registerItem, getDragProps } = useDragSort(
    agendas,
    setAgendas,
  );

  const updateAgenda = (id, changes) => {
    setAgendas((prev) =>
      prev.map((agenda) =>
        agenda.id === id ? { ...agenda, ...changes } : agenda,
      ),
    );
  };

  const handleSubmitAgenda = ({ name, keywords }) => {
    const id = crypto.randomUUID();
    setDraft(null);
    setAgendas((prev) => [
      ...prev,
      { id, name, keywords, minutes: String(AGENDA_DEFAULT_MINUTES) },
    ]);
    setSelectedId(id);
  };

  const handleDeleteAgenda = (id) => {
    setAgendas((prev) => prev.filter((agenda) => agenda.id !== id));
    setSelectedId(null);
  };

  // 수정할 안건은 목록에서 빼서 입력란으로 되돌린다. 다시 추가하면 목록 맨 뒤에 붙는다.
  const handleEditAgenda = (agenda) => {
    handleDeleteAgenda(agenda.id);
    setDraft({ id: agenda.id, name: agenda.name, keywords: agenda.keywords });
  };

  return (
    <div className={styles.page}>
      <BackHeader title="회의 만들기" backTo="/" />

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
                className={`${styles.counter} ${isTitleTooLong ? styles.counterError : ''}`}
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

          <TargetTimeSlider value={targetTime} onChange={setTargetTime} />

          <AgendaForm
            key={draft?.id ?? 'new'}
            agendaCount={agendas.length}
            draft={draft}
            onSubmit={handleSubmitAgenda}
          />

          {agendas.length === 0 ? (
            <p className={styles.emptyText}>등록된 안건이 없어요.</p>
          ) : (
            <ol className={styles.agendaList}>
              {agendas.map((agenda, index) => (
                <li key={agenda.id} ref={registerItem(agenda.id)}>
                  <AgendaCard
                    order={index + 1}
                    agenda={agenda}
                    isSelected={agenda.id === selectedId}
                    isDragging={agenda.id === draggingId}
                    dragProps={getDragProps(agenda.id)}
                    onMinutesChange={(minutes) =>
                      updateAgenda(agenda.id, { minutes })
                    }
                    onSelect={() => setSelectedId(agenda.id)}
                    onEdit={() => handleEditAgenda(agenda)}
                    onDelete={() => handleDeleteAgenda(agenda.id)}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>

        {agendas.length > 0 && (
          <ConsentCheck checked={agreed} onChange={setAgreed} />
        )}
      </main>

      <BottomBar
        icon={canStart ? playWhite : playGray}
        onClick={handleStart}
        disabled={!canStart}
        notice={startBlocker?.message}
        noticeType={startBlocker?.type}
      >
        회의 시작하기
      </BottomBar>
    </div>
  );
};

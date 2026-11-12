import { useState } from 'react';
import {
  addAgenda,
  addAgendaGray,
  close,
  keywordSearch,
  plusOlive,
} from '@/assets';
import {
  AGENDA_MAX_COUNT,
  KEYWORD_MAX_COUNT,
  KEYWORD_MAX_LENGTH,
} from '../constants';
import { FieldLabel } from './FieldLabel';
import styles from './AgendaForm.module.scss';

// 한글 입력 중 Enter를 누르면 조합이 끝나기 전에 한 번 더 호출되므로 막는다.
const isSubmitKey = (event) =>
  event.key === 'Enter' && !event.nativeEvent.isComposing;

// editingAgenda가 있으면 해당 안건을 불러와 수정한다. (바뀔 때마다 key로 새로 마운트)
export const AgendaForm = ({ agendaCount, editingAgenda, onSubmit }) => {
  const isEditing = Boolean(editingAgenda);
  const [name, setName] = useState(editingAgenda?.name ?? '');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState(editingAgenda?.keywords ?? []);

  const trimmedKeyword = keywordInput.trim();
  const isKeywordTooLong = trimmedKeyword.length > KEYWORD_MAX_LENGTH;
  const isKeywordFull = keywords.length >= KEYWORD_MAX_COUNT;
  const canAddKeyword =
    trimmedKeyword.length > 0 &&
    !isKeywordTooLong &&
    !isKeywordFull &&
    !keywords.includes(trimmedKeyword);
  const canSubmit =
    name.trim().length > 0 &&
    !isKeywordTooLong &&
    (isEditing || agendaCount < AGENDA_MAX_COUNT);

  const handleAddKeyword = () => {
    if (!canAddKeyword) return;
    setKeywords((prev) => [...prev, trimmedKeyword]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (target) => {
    setKeywords((prev) => prev.filter((keyword) => keyword !== target));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), keywords });
    setName('');
    setKeywordInput('');
    setKeywords([]);
  };

  const renderKeywordHelper = () => {
    if (isKeywordTooLong) {
      return (
        <p className={`${styles.hint} ${styles.errorText}`}>
          키워드를 {KEYWORD_MAX_LENGTH}자 이내로 입력해주세요.
        </p>
      );
    }
    if (keywords.length > 0) {
      return (
        <ul className={styles.keywordChips}>
          {keywords.map((keyword) => (
            <li key={keyword} className={styles.keywordChip}>
              {keyword}
              <button
                className={styles.removeButton}
                type="button"
                onClick={() => handleRemoveKeyword(keyword)}
                aria-label={`${keyword} 키워드 삭제`}
              >
                <img src={close} alt="" />
              </button>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p className={styles.hint}>키워드는 주제 이탈을 판단할 때 참고해요.</p>
    );
  };

  return (
    <section className={styles.agendaForm}>
      <div className={styles.inputArea}>
        <div className={styles.labelRow}>
          <FieldLabel htmlFor="agenda-name" required>
            안건
          </FieldLabel>
          <span className={styles.count}>
            {agendaCount}/{AGENDA_MAX_COUNT}
          </span>
        </div>

        <div className={styles.inputGroup}>
          <input
            id="agenda-name"
            className={styles.nameInput}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => isSubmitKey(event) && handleSubmit()}
            placeholder="안건을 입력하세요."
            autoComplete="off"
          />
          <label
            className={`${styles.keywordBox} ${isKeywordTooLong ? styles.keywordBoxError : ''}`}
          >
            <span className={styles.keywordIcon}>
              <img src={keywordSearch} alt="" />
            </span>
            <input
              className={styles.keywordInput}
              type="text"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={(event) => isSubmitKey(event) && handleAddKeyword()}
              placeholder="키워드를 입력하세요."
              aria-label="키워드"
              autoComplete="off"
              disabled={isKeywordFull}
            />
            <button
              className={styles.keywordAddButton}
              type="button"
              onClick={handleAddKeyword}
              disabled={!canAddKeyword}
              aria-label="키워드 추가"
            >
              <img src={plusOlive} alt="" />
            </button>
          </label>
        </div>

        {renderKeywordHelper()}
      </div>

      <button
        className={styles.submitButton}
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {isEditing ? (
          '안건 수정하기'
        ) : (
          <>
            <img src={canSubmit ? addAgenda : addAgendaGray} alt="" />
            안건 추가하기
          </>
        )}
      </button>
    </section>
  );
};

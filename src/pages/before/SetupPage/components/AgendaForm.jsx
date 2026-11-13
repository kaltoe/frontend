import { useRef, useState } from 'react';
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

// draft: 수정하려고 카드에서 꺼낸 안건. 바뀔 때마다 key로 새로 마운트해 입력란을 채운다.
export const AgendaForm = ({ agendaCount, draft, onSubmit }) => {
  const [name, setName] = useState(draft?.name ?? '');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState(draft?.keywords ?? []);

  const keywordInputRef = useRef(null);

  const trimmedKeyword = keywordInput.trim();
  const isKeywordTooLong = trimmedKeyword.length > KEYWORD_MAX_LENGTH;
  const canAddKeyword =
    trimmedKeyword.length > 0 &&
    !isKeywordTooLong &&
    keywords.length < KEYWORD_MAX_COUNT;
  const isFull = agendaCount >= AGENDA_MAX_COUNT;
  const isSubmitDisabled = isKeywordTooLong || isFull;

  const handleAddKeyword = () => {
    if (!canAddKeyword) return;
    setKeywords((prev) => [...prev, trimmedKeyword]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (targetIndex) => {
    setKeywords((prev) => prev.filter((_, index) => index !== targetIndex));
  };

  // 키워드 입력란에 추가하지 않은 키워드가 남아 있으면 함께 등록한다.
  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitDisabled) return;
    onSubmit({
      name: trimmedName,
      keywords: canAddKeyword ? [...keywords, trimmedKeyword] : keywords,
    });
    setName('');
    setKeywordInput('');
    setKeywords([]);
  };

  const keywordError = isKeywordTooLong && (
    <p className={`${styles.hint} ${styles.errorText}`}>
      키워드를 {KEYWORD_MAX_LENGTH}자 이내로 입력해주세요.
    </p>
  );

  const renderKeywordHelper = () => {
    if (keywords.length > 0) {
      return (
        <>
          <ul className={styles.keywordChips}>
            {keywords.map((keyword, index) => (
              <li key={index} className={styles.keywordChip}>
                {keyword}
                <button
                  className={styles.removeButton}
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  aria-label={`${keyword} 키워드 삭제`}
                >
                  <img src={close} alt="" />
                </button>
              </li>
            ))}
          </ul>
          {keywordError}
        </>
      );
    }
    return (
      keywordError || (
        <p className={styles.hint}>키워드는 주제 이탈을 판단할 때 참고해요.</p>
      )
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
            onKeyDown={(event) =>
              isSubmitKey(event) && keywordInputRef.current?.focus()
            }
            placeholder="안건을 입력하세요."
            autoComplete="off"
            autoFocus={Boolean(draft)}
          />
          <label
            className={`${styles.keywordBox} ${isKeywordTooLong ? styles.keywordBoxError : ''}`}
          >
            <span className={styles.keywordIcon}>
              <img src={keywordSearch} alt="" />
            </span>
            <input
              ref={keywordInputRef}
              className={styles.keywordInput}
              type="text"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={(event) => isSubmitKey(event) && handleAddKeyword()}
              placeholder="키워드를 입력하세요."
              aria-label="키워드"
              autoComplete="off"
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
        disabled={isSubmitDisabled}
      >
        <img src={isSubmitDisabled ? addAgendaGray : addAgenda} alt="" />
        안건 추가하기
      </button>
    </section>
  );
};

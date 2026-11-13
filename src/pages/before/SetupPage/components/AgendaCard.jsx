import { dragHandle, edit, trash } from '@/assets';
import { AGENDA_MINUTES_MAX_DIGITS } from '../constants';
import styles from './AgendaCard.module.scss';

export const AgendaCard = ({
  order,
  agenda,
  isDragging,
  dragProps,
  onMinutesChange,
  onEdit,
  onDelete,
}) => {
  const handleMinutesChange = (event) => {
    onMinutesChange(
      event.target.value.replace(/\D/g, '').slice(0, AGENDA_MINUTES_MAX_DIGITS),
    );
  };

  return (
    <article
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      {...dragProps}
    >
      <div className={styles.main}>
        <span className={styles.handle} aria-hidden="true" data-drag-handle>
          <img src={dragHandle} alt="" />
          <img src={dragHandle} alt="" />
        </span>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <span className={styles.order}>{order}</span>
            <h3 className={styles.name}>{agenda.name}</h3>
          </div>
          {agenda.keywords.length > 0 && (
            <ul className={styles.keywords}>
              {agenda.keywords.map((keyword, index) => (
                <li key={index} className={styles.keyword}>
                  {keyword}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.side}>
        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            type="button"
            onClick={onEdit}
            aria-label={`${agenda.name} 안건 수정`}
          >
            <img src={edit} alt="" />
          </button>
          <button
            className={styles.iconButton}
            type="button"
            onClick={onDelete}
            aria-label={`${agenda.name} 안건 삭제`}
          >
            <img src={trash} alt="" />
          </button>
        </div>
        <label className={styles.minutes}>
          <input
            className={styles.minutesInput}
            type="text"
            inputMode="numeric"
            value={agenda.minutes}
            onChange={handleMinutesChange}
            placeholder="0"
            aria-label={`${agenda.name} 안건 시간`}
            autoComplete="off"
          />
          <span className={styles.minutesUnit}>분</span>
        </label>
      </div>
    </article>
  );
};

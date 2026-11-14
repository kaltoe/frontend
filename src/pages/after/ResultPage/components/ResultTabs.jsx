import { RESULT_TABS } from '../constants';
import styles from './ResultTabs.module.scss';

export const ResultTabs = ({ value, onChange }) => {
  return (
    <div className={styles.tabs} role="tablist">
      {RESULT_TABS.map((tab) => (
        <button
          key={tab.value}
          className={`${styles.tab} ${value === tab.value ? styles.tabSelected : ''}`}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

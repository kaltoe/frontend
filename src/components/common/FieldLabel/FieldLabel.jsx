import { required as requiredIcon } from '@/assets';
import styles from './FieldLabel.module.scss';

export const FieldLabel = ({ htmlFor, required = false, children }) => {
  const Tag = htmlFor ? 'label' : 'span';

  return (
    <Tag className={styles.label} htmlFor={htmlFor}>
      {children}
      {required && (
        <img className={styles.requiredIcon} src={requiredIcon} alt="필수" />
      )}
    </Tag>
  );
};

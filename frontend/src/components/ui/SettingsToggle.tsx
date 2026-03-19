import React, { useId } from 'react';
import styles from './SettingsToggle.module.css';

interface Props {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const SettingsToggle: React.FC<Props> = ({ label, description, checked, onChange }) => {
  const id = useId();

  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.on : styles.off}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
};

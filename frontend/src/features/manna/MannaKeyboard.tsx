import React from 'react';
import { useTranslation } from 'react-i18next';
import { SoundService } from '../../services/SoundService';
import './manna.css';

type KeyState = 'unused' | 'correct' | 'present' | 'absent';

interface MannaKeyboardProps {
  keyStates: Record<string, KeyState>;
  onKey: (key: string) => void;
  disabled?: boolean;
  loading?: boolean; // shows spinner on ENTER during API submit
}

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

export const MannaKeyboard: React.FC<MannaKeyboardProps> = React.memo(({ keyStates, onKey, disabled, loading }) => {
  const { t } = useTranslation();

  const stateClass = (key: string): string => {
    const s = keyStates[key] ?? 'unused';
    if (s === 'unused') return '';
    return `manna-key--${s}`;
  };

  const renderKeyLabel = (key: string) => {
    if (key === 'ENTER' && loading) {
      return <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin inline-block" />;
    }
    return key;
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none" aria-label={t('manna.keyboard', 'Keyboard')}>
      {ROWS.map((row, r) => (
        <div key={r} className="flex gap-1">
          {row.map(key => (
            <button
              key={key}
              className={`manna-key ${key.length > 1 ? 'manna-key--wide' : ''} ${stateClass(key)} ${key === 'ENTER' && loading ? 'opacity-70' : ''}`}
              onClick={() => {
                if (disabled || loading) return;
                // M-16: play key sound only from on-screen taps, not physical keyboard
                if (key.length === 1) SoundService.play('manna-key');
                onKey(key);
              }}
              disabled={disabled || (key === 'ENTER' && loading)}
              aria-label={key === '⌫' ? t('manna.delete', 'Delete') : key === 'ENTER' ? t('manna.enter', 'Enter') : key}
            >
              {renderKeyLabel(key)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
});

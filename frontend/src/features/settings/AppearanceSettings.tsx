import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SoundService } from '../../services/SoundService';
import { SettingsToggle } from '../../components/ui/SettingsToggle';
import { ThemePicker } from './ThemePicker';

const ANIM_KEY = 'celebrationAnimEnabled';
const VERSE_FONT_SIZES = ['1rem', '1.125rem', '1.25rem', '1.5rem', '1.875rem'];
const FONT_SIZE_LABELS = ['S', 'M', 'L', 'XL', 'XXL'];

export const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation();
  const [soundEnabled, setSoundEnabled] = useState(() => SoundService.isEnabled());
  const [animEnabled, setAnimEnabled] = useState(
    () => localStorage.getItem(ANIM_KEY) !== 'false'
  );
  const [verseFontSize, setVerseFontSize] = useState(
    () => Math.min(5, Math.max(1, Number(localStorage.getItem('verseFontSize') ?? 3)))
  );

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    SoundService.setEnabled(value);
    if (value) {
      SoundService.play('journal-save');
    }
  };

  const handleAnimToggle = (value: boolean) => {
    setAnimEnabled(value);
    localStorage.setItem(ANIM_KEY, String(value));
  };

  const handleFontSizeChange = (step: number) => {
    setVerseFontSize(step);
    localStorage.setItem('verseFontSize', String(step));
    document.documentElement.style.setProperty('--verse-font-size', VERSE_FONT_SIZES[step - 1]);
  };

  return (
    <div>
      <ThemePicker />

      {/* Verse text size */}
      <div style={{ marginTop: '1.5rem', padding: '1rem 0', borderTop: '1px solid var(--theme-border, var(--journal-border))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>
            {t('settings.appearance.verseFontSize', 'Verse Text Size')}
          </span>
          <span style={{ fontSize: 'var(--verse-font-size)', fontFamily: 'Georgia, serif', color: 'var(--candle-amber)', lineHeight: 1 }}>
            {t('settings.appearance.verseFontSizePreview', 'Aa')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--grace-lavender)', fontFamily: 'Georgia, serif' }}>A</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={verseFontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--candle-amber)' }}
            aria-label={t('settings.appearance.verseFontSize', 'Verse Text Size')}
          />
          <span style={{ fontSize: '1.1rem', color: 'var(--grace-lavender)', fontFamily: 'Georgia, serif' }}>A</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', padding: '0 1.5rem' }}>
          {FONT_SIZE_LABELS.map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: '0.65rem',
                color: verseFontSize === i + 1 ? 'var(--candle-amber)' : 'var(--grace-lavender)',
                fontWeight: verseFontSize === i + 1 ? 700 : 400,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleFontSizeChange(i + 1)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <SettingsToggle
          label={t('settings.appearance.celebrationAnim', 'Celebration Animations')}
          description={t('settings.appearance.celebrationAnimDesc', 'Show particle effects when you reach a milestone.')}
          checked={animEnabled}
          onChange={handleAnimToggle}
        />
        <SettingsToggle
          label={t('settings.appearance.soundEffects', 'Sound Effects')}
          description={t('settings.appearance.soundEffectsDesc', 'Play soft tones when saving journal entries or continuing your streak.')}
          checked={soundEnabled}
          onChange={handleSoundToggle}
        />
      </div>
    </div>
  );
};

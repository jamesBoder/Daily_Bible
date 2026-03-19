import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SoundService } from '../../services/SoundService';
import { SettingsToggle } from '../../components/ui/SettingsToggle';
import { ThemePicker } from './ThemePicker';

const ANIM_KEY = 'celebrationAnimEnabled';

export const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation();
  const [soundEnabled, setSoundEnabled] = useState(() => SoundService.isEnabled());
  const [animEnabled, setAnimEnabled] = useState(
    () => localStorage.getItem(ANIM_KEY) !== 'false'
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

  return (
    <div>
      <ThemePicker />
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

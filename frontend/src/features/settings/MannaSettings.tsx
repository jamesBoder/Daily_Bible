import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsToggle } from '../../components/ui/SettingsToggle';
import { SoundService } from '../../services/SoundService';

const HARD_MODE_KEY = 'mannaHardMode';
export const PHYSICAL_KEY_SOUND_KEY = 'mannaPhysicalKeySound';

export const MannaSettings: React.FC = () => {
  const { t } = useTranslation();
  const [hardMode, setHardMode] = useState(false);
  const [physicalKeySound, setPhysicalKeySound] = useState(false);

  useEffect(() => {
    setHardMode(localStorage.getItem(HARD_MODE_KEY) === 'true');
    setPhysicalKeySound(localStorage.getItem(PHYSICAL_KEY_SOUND_KEY) === 'true');
  }, []);

  const toggleHardMode = (enabled: boolean) => {
    setHardMode(enabled);
    localStorage.setItem(HARD_MODE_KEY, String(enabled));
  };

  const togglePhysicalKeySound = (enabled: boolean) => {
    setPhysicalKeySound(enabled);
    localStorage.setItem(PHYSICAL_KEY_SOUND_KEY, String(enabled));
    // Play a preview so the user hears the effect immediately
    if (enabled) SoundService.play('manna-key');
  };

  return (
    <div className="space-y-3">
      <SettingsToggle
        label={t('settings.manna.hardMode', 'Hard Mode')}
        description={t(
          'settings.manna.hardModeDesc',
          'Confirmed letters must be reused in every subsequent guess.'
        )}
        checked={hardMode}
        onChange={toggleHardMode}
      />
      <SettingsToggle
        label={t('settings.manna.physicalKeySound', 'Physical Keyboard Sounds')}
        description={t(
          'settings.manna.physicalKeySoundDesc',
          'Play a sound when typing with your physical keyboard.'
        )}
        checked={physicalKeySound}
        onChange={togglePhysicalKeySound}
      />
    </div>
  );
};

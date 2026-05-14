import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '@phosphor-icons/react';
import { useRosary } from '../../hooks/useRosary';
import { type MysterySetKey } from './data/rosaryData';
import MysterySelectScreen from './MysterySelectScreen';
import RosaryBeads from './RosaryBeads';
import RosaryPrayerCard from './RosaryPrayerCard';
import prayerApi from '../../services/api/prayer';
import { SoundService } from '../../services/SoundService';
import toast from 'react-hot-toast';

interface RosaryViewProps {
  onBack: () => void;
}

type RosaryScreen = 'select' | 'praying';

const RosaryView: React.FC<RosaryViewProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const rosary = useRosary();
  const completionFiredRef = useRef(false);

  // Always start at the mystery selector — user can resume or start fresh.
  // This ensures they always consciously choose which mystery set to pray.
  const [screen, setScreen] = useState<RosaryScreen>('select');

  // Fire completion API call once when rosary is marked complete
  useEffect(() => {
    if (rosary.isComplete && !completionFiredRef.current) {
      completionFiredRef.current = true;
      SoundService.play('rosary-complete');
      if (navigator.vibrate) navigator.vibrate([20, 60, 20]);
      prayerApi.completeRosary(rosary.mysterySetKey).catch(() => {
        // Silently swallow — blessings credit failure shouldn't interrupt prayer
        toast.error(t('blessings.creditError', 'Could not record completion'), { duration: 3000 });
      });
    }
    if (!rosary.isComplete) {
      completionFiredRef.current = false;
    }
  }, [rosary.isComplete, rosary.mysterySetKey, t]);

  const handleResume = () => {
    // Session state is already loaded in useRosary — just show the beads screen
    if (navigator.vibrate) navigator.vibrate(8);
    setScreen('praying');
  };

  const handleStart = (key: MysterySetKey) => {
    rosary.startSession(key);
    setScreen('praying');
  };

  const handleReset = () => {
    rosary.reset();
    setScreen('select');
  };

  const activeBeadRingIndex = (screen === 'praying' && !rosary.isComplete)
    ? Math.min(rosary.completedBeads, rosary.totalBeads - 1)
    : -1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-200/40 dark:border-amber-800/30">
        <button
          onClick={screen === 'praying' ? () => setScreen('select') : onBack}
          className="p-1.5 -ml-1 rounded-full text-[var(--journal-text-muted)] hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label={screen === 'praying' ? t('common.back', 'Back') : t('common.close', 'Close')}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold text-[var(--foreground)]">
          {t('prayer.rosaryTitle', 'The Rosary')}
        </h1>
        {screen === 'praying' && !rosary.isComplete && (
          <button
            onClick={handleReset}
            className="ml-auto text-xs text-[var(--journal-text-muted)] hover:text-red-400 transition-colors"
          >
            {t('prayer.restart', 'Restart')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {screen === 'select' ? (
          <MysterySelectScreen
            hasSession={rosary.hasSession}
            sessionKey={rosary.mysterySetKey}
            sessionStep={rosary.stepIndex}
            onStart={handleStart}
            onResume={handleResume}
          />
        ) : (
          <>
            <RosaryBeads
              totalBeads={rosary.totalBeads}
              completedBeads={rosary.completedBeads}
              activeBeadIndex={activeBeadRingIndex}
              onAdvance={rosary.isComplete ? undefined : rosary.advance}
            />
            <RosaryPrayerCard
              step={rosary.currentStep}
              prayer={rosary.currentPrayer}
              mystery={rosary.currentMystery}
              completedBeads={rosary.completedBeads}
              totalBeads={rosary.totalBeads}
              isComplete={rosary.isComplete}
              onAdvance={rosary.advance}
              onReset={handleReset}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RosaryView;

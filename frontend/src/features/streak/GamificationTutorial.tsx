import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const GAMIFICATION_TUTORIAL_KEY = 'gamificationSeenTutorial';

interface GamificationTutorialProps {
  onDismiss: () => void;
}

export const GamificationTutorial: React.FC<GamificationTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '🔥',
      title: t('gamificationTutorial.step1Title', 'Build your streak'),
      body: t('gamificationTutorial.step1Body', 'Read the daily verse every day to grow your streak. The longer the streak, the more Blessings ✦ you earn per day.'),
    },
    {
      emoji: '✦',
      title: t('gamificationTutorial.step2Title', 'Earn Blessings ✦'),
      body: t('gamificationTutorial.step2Body', 'Blessings are earned by reading daily, completing Manna puzzles, and hitting milestones. Spend them on hints or themes in the Shop.'),
    },
    {
      emoji: '🏆',
      title: t('gamificationTutorial.step3Title', 'Hit milestones'),
      body: t('gamificationTutorial.step3Body', 'Reach streak milestones (7, 30, 100 days and beyond) to unlock celebration moments and bonus Blessings rewards.'),
    },
    {
      emoji: '📊',
      title: t('gamificationTutorial.step4Title', 'Track your journey'),
      body: t('gamificationTutorial.step4Body', 'View your streak history, longest streak, and total Blessings balance on your Profile page.'),
    },
  ];

  return (
    <TutorialModal
      icon="✦"
      title={t('gamificationTutorial.title', 'Streaks & Blessings')}
      subtitle={t('gamificationTutorial.subtitle', 'Stay consistent, earn rewards, and grow in faith every day.')}
      steps={steps}
      ctaLabel={t('gamificationTutorial.cta', 'Start Earning')}
      reopenHint={t('gamificationTutorial.reopenHint', 'Find this in Settings → Help & Tutorials anytime.')}
      onDismiss={onDismiss}
    />
  );
};

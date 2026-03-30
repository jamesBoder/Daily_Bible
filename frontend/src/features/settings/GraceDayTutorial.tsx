import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const GRACE_DAY_TUTORIAL_KEY = 'graceDaySeenTutorial';

interface GraceDayTutorialProps {
  onDismiss: () => void;
}

export const GraceDayTutorial: React.FC<GraceDayTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '🔥',
      title: t('graceDayTutorial.step1Title', 'Your streak matters'),
      body: t('graceDayTutorial.step1Body', 'Read the daily verse every day to build your streak. Streaks unlock milestones and earn you Blessings ✦.'),
    },
    {
      emoji: '🛡️',
      title: t('graceDayTutorial.step2Title', 'Grace Days protect your streak'),
      body: t('graceDayTutorial.step2Body', 'If you miss a day, use a Grace Day to keep your streak alive. You get 2 Grace Days per period.'),
    },
    {
      emoji: '📅',
      title: t('graceDayTutorial.step3Title', 'How to use one'),
      body: t('graceDayTutorial.step3Body', 'Tap "Use a Grace Day" below and confirm. It counts yesterday as a reading day, keeping your streak alive.'),
    },
    {
      emoji: '🔄',
      title: t('graceDayTutorial.step4Title', 'Grace Days refill automatically'),
      body: t('graceDayTutorial.step4Body', 'Your 2 Grace Days refill each calendar month. Use them wisely — once used they\'re gone until the next reset.'),
    },
  ];

  return (
    <TutorialModal
      icon="🛡️"
      title={t('graceDayTutorial.title', 'Grace Days')}
      subtitle={t('graceDayTutorial.subtitle', 'Missed a day? Protect your streak with a Grace Day.')}
      steps={steps}
      ctaLabel={t('graceDayTutorial.cta', 'Got it!')}
      reopenHint={t('graceDayTutorial.reopenHint', 'Tap ? in the Grace Days panel to see this again.')}
      onDismiss={onDismiss}
    />
  );
};

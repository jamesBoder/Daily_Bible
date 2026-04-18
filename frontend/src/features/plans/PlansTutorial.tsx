import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const PLANS_TUTORIAL_KEY = 'plansSeenTutorial';

interface PlansTutorialProps {
  onDismiss: () => void;
}

export const PlansTutorial: React.FC<PlansTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '🗺️',
      title: t('plan.tutorial.step1Title', 'Your guided path'),
      body: t('plan.tutorial.step1Body', 'Reading plans take you through curated Scripture day by day. Each plan follows a theme — peace, gratitude, the cross, and more.'),
    },
    {
      emoji: '📖',
      title: t('plan.tutorial.step2Title', 'Read, reflect, pray'),
      body: t('plan.tutorial.step2Body', 'Each day shows a passage with a reflection, prayer, and a journaling prompt. Take as long as you need — there\'s no timer.'),
    },
    {
      emoji: '✅',
      title: t('plan.tutorial.step3Title', 'Mark your progress'),
      body: t('plan.tutorial.step3Body', 'Tap "Mark as Read" when you\'ve finished a day. Your progress is saved automatically so you can pick up where you left off.'),
    },
    {
      emoji: '✦',
      title: t('plan.tutorial.step4Title', 'Free & Devoted plans'),
      body: t('plan.tutorial.step4Body', '"Walking in Peace" is free for everyone. Devoted Members unlock the full library — including seasonal Advent, Lent, and Holy Week journeys.'),
    },
  ];

  return (
    <TutorialModal
      icon="🗺️"
      title={t('plan.tutorial.title', 'Reading Plans')}
      subtitle={t('plan.tutorial.subtitle', 'A guided journey through Scripture, one day at a time.')}
      steps={steps}
      ctaLabel={t('plan.tutorial.cta', 'Explore Plans')}
      reopenHint={t('plan.tutorial.reopenHint', 'Tap ? anytime to see this guide again.')}
      onDismiss={onDismiss}
    />
  );
};

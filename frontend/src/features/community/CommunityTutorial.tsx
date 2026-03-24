import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const COMMUNITY_TUTORIAL_KEY = 'communitySeenTutorial';

interface CommunityTutorialProps {
  onDismiss: () => void;
}

export const CommunityTutorial: React.FC<CommunityTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '📋',
      title: t('community.tutorial.step1Title', 'Community Board'),
      body: t('community.tutorial.step1Body', 'Read and share reflections, encouragements, and thoughts with the Words of Praise community.'),
    },
    {
      emoji: '🙏',
      title: t('community.tutorial.step2Title', 'Prayer Wall'),
      body: t('community.tutorial.step2Body', 'Submit prayer requests and pray for others. A space for intercession and support.'),
    },
    {
      emoji: '⚡',
      title: t('community.tutorial.step3Title', 'Challenges'),
      body: t('community.tutorial.step3Body', 'Join reading and devotional challenges. Complete them to earn Blessings ✦ and grow in faith.'),
    },
    {
      emoji: '❤️',
      title: t('community.tutorial.step4Title', 'React & connect'),
      body: t('community.tutorial.step4Body', 'Tap the reaction buttons on any post to show encouragement. New posts appear automatically.'),
    },
  ];

  return (
    <TutorialModal
      icon="🤝"
      title={t('community.tutorial.title', 'Community')}
      subtitle={t('community.tutorial.subtitle', 'Connect with believers, share reflections, and pray together.')}
      steps={steps}
      ctaLabel={t('community.tutorial.cta', 'Join the Community')}
      reopenHint={t('community.tutorial.reopenHint', 'Tap ? anytime to see this guide again.')}
      onDismiss={onDismiss}
    />
  );
};

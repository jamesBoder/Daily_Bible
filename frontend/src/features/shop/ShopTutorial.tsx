import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const SHOP_TUTORIAL_KEY = 'shopSeenTutorial';

interface ShopTutorialProps {
  onDismiss: () => void;
}

export const ShopTutorial: React.FC<ShopTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '✦',
      title: t('shopTutorial.step1Title', 'Your Blessings balance'),
      body: t('shopTutorial.step1Body', 'Your Blessings ✦ balance is shown at the top of this page. Everything in the shop is purchased with Blessings or a Premium subscription.'),
    },
    {
      emoji: '🎨',
      title: t('shopTutorial.step2Title', 'Unlock themes'),
      body: t('shopTutorial.step2Body', 'Purchase beautiful app themes with Blessings to personalize your experience. Premium members unlock all themes.'),
    },
    {
      emoji: '👑',
      title: t('shopTutorial.step3Title', 'Go Premium'),
      body: t('shopTutorial.step3Body', 'Premium unlocks unlimited journal entries, all translations, saved searches, a Blessings multiplier, and more.'),
    },
    {
      emoji: '🛍️',
      title: t('shopTutorial.step4Title', 'One-time purchases'),
      body: t('shopTutorial.step4Body', 'Some features are available as permanent one-time unlocks — no subscription needed.'),
    },
  ];

  return (
    <TutorialModal
      icon="🛍️"
      title={t('shopTutorial.title', 'Rewards Shop')}
      subtitle={t('shopTutorial.subtitle', 'Spend Blessings, unlock themes, and upgrade your experience.')}
      steps={steps}
      ctaLabel={t('shopTutorial.cta', 'Explore the Shop')}
      reopenHint={t('shopTutorial.reopenHint', 'Tap ? anytime to see this guide again.')}
      onDismiss={onDismiss}
    />
  );
};

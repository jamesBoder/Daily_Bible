import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const FAVORITES_TUTORIAL_KEY = 'favoritesSeenTutorial';

interface FavoritesTutorialProps {
  onDismiss: () => void;
}

export const FavoritesTutorial: React.FC<FavoritesTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '❤️',
      title: t('favorites.tutorial.step1Title', 'Save any verse'),
      body: t('favorites.tutorial.step1Body', 'Tap the heart icon on any verse to save it here for quick access.'),
    },
    {
      emoji: '👆',
      title: t('favorites.tutorial.step2Title', 'Tap to expand'),
      body: t('favorites.tutorial.step2Body', 'Tap a verse card to reveal sharing options, notes, and the remove button.'),
    },
    {
      emoji: '📤',
      title: t('favorites.tutorial.step3Title', 'Share with others'),
      body: t('favorites.tutorial.step3Body', 'Share your favorite verses to Twitter, WhatsApp, Facebook, or copy to clipboard.'),
    },
    {
      emoji: '🔍',
      title: t('favorites.tutorial.step4Title', 'Filter & sort'),
      body: t('favorites.tutorial.step4Body', 'Use the search bar to filter by keyword, and the sort menu to order by date, book, or translation.'),
    },
  ];

  return (
    <TutorialModal
      icon="❤️"
      title={t('favorites.tutorial.title', 'Favorites')}
      subtitle={t('favorites.tutorial.subtitle', 'Your personal collection of saved Bible verses.')}
      steps={steps}
      ctaLabel={t('favorites.tutorial.cta', 'Explore My Favorites')}
      reopenHint={t('favorites.tutorial.reopenHint', 'Tap ? anytime to see this guide again.')}
      onDismiss={onDismiss}
    />
  );
};

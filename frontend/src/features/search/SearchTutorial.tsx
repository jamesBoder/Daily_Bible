import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const SEARCH_TUTORIAL_KEY = 'searchSeenTutorial';

interface SearchTutorialProps {
  onDismiss: () => void;
}

export const SearchTutorial: React.FC<SearchTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '🔎',
      title: t('search.tutorial.step1Title', 'Search by keyword or reference'),
      body: t('search.tutorial.step1Body', 'Type a word, phrase, or reference like "John 3:16" to find matching verses across the Bible.'),
    },
    {
      emoji: '📖',
      title: t('search.tutorial.step2Title', 'Browse results'),
      body: t('search.tutorial.step2Body', 'Each result shows the verse text and reference. Tap a verse to see full details and actions.'),
    },
    {
      emoji: '❤️',
      title: t('search.tutorial.step3Title', 'Save what speaks to you'),
      body: t('search.tutorial.step3Body', 'Tap the heart icon on any result to add it to your Favorites for later.'),
    },
    {
      emoji: '🌍',
      title: t('search.tutorial.step4Title', 'Multiple translations'),
      body: t('search.tutorial.step4Body', 'Results pull from all supported Bible translations. Premium members can also save and revisit their search history.'),
    },
  ];

  return (
    <TutorialModal
      icon="🔎"
      title={t('search.tutorial.title', 'Search Scripture')}
      subtitle={t('search.tutorial.subtitle', 'Find any verse, word, or passage in the Bible instantly.')}
      steps={steps}
      ctaLabel={t('search.tutorial.cta', 'Start Searching')}
      reopenHint={t('search.tutorial.reopenHint', 'Tap ? anytime to see this guide again.')}
      onDismiss={onDismiss}
    />
  );
};

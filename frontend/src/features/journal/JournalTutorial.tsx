import React from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialModal } from '../../components/common/TutorialModal';

export const JOURNAL_TUTORIAL_KEY = 'journalSeenTutorial';

interface JournalTutorialProps {
  onDismiss: () => void;
}

export const JournalTutorial: React.FC<JournalTutorialProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const steps = [
    {
      emoji: '🪶',
      title: t('journal.tutorial.step1Title', 'Write daily reflections'),
      body: t('journal.tutorial.step1Body', 'Tap "New Entry" to start writing. Each entry can include a reflection, prayer, or whatever is on your heart.'),
    },
    {
      emoji: '📖',
      title: t('journal.tutorial.step2Title', 'Link to a verse'),
      body: t('journal.tutorial.step2Body', 'Entries can be connected to the daily verse or any scripture passage for deeper context.'),
    },
    {
      emoji: '✏️',
      title: t('journal.tutorial.step3Title', 'Edit & revisit'),
      body: t('journal.tutorial.step3Body', 'Tap any entry to open and edit it. Your journal grows with you day by day.'),
    },
    {
      emoji: '🔒',
      title: t('journal.tutorial.step4Title', 'Private & secure'),
      body: t('journal.tutorial.step4Body', 'Your entries are only visible to you. Premium members can store unlimited entries.'),
    },
  ];

  return (
    <TutorialModal
      icon="🪶"
      title={t('journal.tutorial.title', 'My Journal')}
      subtitle={t('journal.tutorial.subtitle', 'A private space for prayer, reflection, and spiritual growth.')}
      steps={steps}
      ctaLabel={t('journal.tutorial.cta', 'Start Writing')}
      reopenHint={t('journal.tutorial.reopenHint', 'Tap ? anytime to see this guide again.')}
      onDismiss={onDismiss}
    />
  );
};

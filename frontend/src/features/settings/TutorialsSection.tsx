import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JournalTutorial, JOURNAL_TUTORIAL_KEY } from '../journal/JournalTutorial';
import { FavoritesTutorial, FAVORITES_TUTORIAL_KEY } from '../favorites/FavoritesTutorial';
import { SearchTutorial, SEARCH_TUTORIAL_KEY } from '../search/SearchTutorial';
import { CommunityTutorial, COMMUNITY_TUTORIAL_KEY } from '../community/CommunityTutorial';
import { MannaHowToPlay, MANNA_TUTORIAL_KEY } from '../manna/MannaHowToPlay';
import { GraceDayTutorial, GRACE_DAY_TUTORIAL_KEY } from './GraceDayTutorial';
import { GamificationTutorial, GAMIFICATION_TUTORIAL_KEY } from '../streak/GamificationTutorial';
import { ShopTutorial, SHOP_TUTORIAL_KEY } from '../shop/ShopTutorial';

type TutorialId = 'journal' | 'favorites' | 'search' | 'community' | 'manna' | 'graceDay' | 'gamification' | 'shop';

const TUTORIALS: {
  id: TutorialId;
  emoji: string;
  labelKey: string;
  fallback: string;
  descKey: string;
  descFallback: string;
  storageKey: string;
}[] = [
  {
    id: 'gamification',
    emoji: '✦',
    labelKey: 'gamificationTutorial.title',
    fallback: 'Streaks & Blessings',
    descKey: 'gamificationTutorial.subtitle',
    descFallback: 'Stay consistent, earn rewards, and grow in faith every day.',
    storageKey: GAMIFICATION_TUTORIAL_KEY,
  },
  {
    id: 'graceDay',
    emoji: '🛡️',
    labelKey: 'settings.graceDays.title',
    fallback: 'Grace Days',
    descKey: 'graceDayTutorial.subtitle',
    descFallback: 'Missed a day? Protect your streak with a Grace Day.',
    storageKey: GRACE_DAY_TUTORIAL_KEY,
  },
  {
    id: 'journal',
    emoji: '🪶',
    labelKey: 'nav.journal',
    fallback: 'Journal',
    descKey: 'journal.tutorial.subtitle',
    descFallback: 'A private space for prayer, reflection, and spiritual growth.',
    storageKey: JOURNAL_TUTORIAL_KEY,
  },
  {
    id: 'favorites',
    emoji: '❤️',
    labelKey: 'nav.favorites',
    fallback: 'Favorites',
    descKey: 'favorites.tutorial.subtitle',
    descFallback: 'Your personal collection of saved Bible verses.',
    storageKey: FAVORITES_TUTORIAL_KEY,
  },
  {
    id: 'search',
    emoji: '🔎',
    labelKey: 'nav.search',
    fallback: 'Search',
    descKey: 'search.tutorial.subtitle',
    descFallback: 'Find any verse, word, or passage in the Bible instantly.',
    storageKey: SEARCH_TUTORIAL_KEY,
  },
  {
    id: 'community',
    emoji: '🤝',
    labelKey: 'nav.community',
    fallback: 'Community',
    descKey: 'community.tutorial.subtitle',
    descFallback: 'Connect with believers, share reflections, and pray together.',
    storageKey: COMMUNITY_TUTORIAL_KEY,
  },
  {
    id: 'manna',
    emoji: '🌾',
    labelKey: 'nav.manna',
    fallback: 'Manna Puzzle',
    descKey: 'manna.tutorialIntro',
    descFallback: 'Guess the 5-letter Biblical word in 6 tries.',
    storageKey: MANNA_TUTORIAL_KEY,
  },
  {
    id: 'shop',
    emoji: '🛍️',
    labelKey: 'shopTutorial.title',
    fallback: 'Rewards Shop',
    descKey: 'shopTutorial.subtitle',
    descFallback: 'Spend Blessings, unlock themes, and upgrade your experience.',
    storageKey: SHOP_TUTORIAL_KEY,
  },
];

export const TutorialsSection: React.FC = () => {
  const { t } = useTranslation();
  const [openTutorial, setOpenTutorial] = useState<TutorialId | null>(null);

  const handleOpen = (id: TutorialId) => setOpenTutorial(id);
  const handleClose = () => setOpenTutorial(null);

  return (
    <>
      {/* Active tutorial overlays */}
      {openTutorial === 'journal'        && <JournalTutorial onDismiss={handleClose} />}
      {openTutorial === 'favorites'      && <FavoritesTutorial onDismiss={handleClose} />}
      {openTutorial === 'search'         && <SearchTutorial onDismiss={handleClose} />}
      {openTutorial === 'community'      && <CommunityTutorial onDismiss={handleClose} />}
      {openTutorial === 'manna'          && <MannaHowToPlay onDismiss={handleClose} />}
      {openTutorial === 'graceDay'       && <GraceDayTutorial onDismiss={handleClose} />}
      {openTutorial === 'gamification'   && <GamificationTutorial onDismiss={handleClose} />}
      {openTutorial === 'shop'           && <ShopTutorial onDismiss={handleClose} />}

      <div className="space-y-2">
        {TUTORIALS.map((tut) => {
          const seen = !!localStorage.getItem(tut.storageKey);
          return (
            <button
              key={tut.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => handleOpen(tut.id)}
            >
              <span className="text-2xl flex-shrink-0" aria-hidden>{tut.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t(tut.labelKey, tut.fallback)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {t(tut.descKey, tut.descFallback)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!seen && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                    {t('tutorial.newBadge', 'New')}
                  </span>
                )}
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStreak } from '../../contexts/StreakContext';
import { useCommunity } from '../../hooks/useCommunity';
import { useTutorial } from '../../hooks/useTutorial';
import { CommunityTutorial, COMMUNITY_TUTORIAL_KEY } from './CommunityTutorial';
import { communityApi } from '../../services/api/community';
import { CommunityPostCard } from './CommunityPostCard';
import { CommunityPostSkeleton } from './CommunityPostSkeleton';
import { CommunityComposer } from './CommunityComposer';
import { AdminComposer } from './AdminComposer';
import { WalkingToday } from './WalkingToday';
import { PrayerWallTab } from './PrayerWallTab';
import { ChallengesTab } from './ChallengesTab';
import { BookOpen, HandsPraying, Lightning } from '@phosphor-icons/react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullRefreshIndicator from '../../components/common/PullRefreshIndicator';
import './community.css';

type Tab = 'board' | 'prayer' | 'challenges';

const TAB_CONFIG: { id: Tab; labelKey: string; fallback: string; Icon: React.ElementType }[] = [
  { id: 'board',      labelKey: 'community.tab.board',      fallback: 'Board',      Icon: BookOpen    },
  { id: 'prayer',     labelKey: 'community.tab.prayer',     fallback: 'Prayer Wall', Icon: HandsPraying },
  { id: 'challenges', labelKey: 'community.tab.challenges', fallback: 'Challenges', Icon: Lightning   },
];

const NEW_POSTS_POLL_INTERVAL_MS = 90_000;
const SKELETON_COUNT = 3;

export const CommunityView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useStreak();
  const isPremium = subscription?.is_premium ?? false;
  const { showTutorial, dismissTutorial, openTutorial } = useTutorial(COMMUNITY_TUTORIAL_KEY);

  const [activeTab, setActiveTab] = useState<Tab>('board');
  // 'hidden' | 'visible' | 'dismissing'
  const [bannerState, setBannerState] = useState<'hidden' | 'visible' | 'dismissing'>('hidden');
  const composerRef = useRef<HTMLDivElement>(null);

  const { posts, isLoading, hasMore, isAdmin, error, loadMore, createPost, deletePost, addReaction, removeReaction, reload } =
    useCommunity();

  // ── Pill tab sliding background ──────────────────────────────────────────
  const tabRefs = {
    board:      useRef<HTMLButtonElement>(null),
    prayer:     useRef<HTMLButtonElement>(null),
    challenges: useRef<HTMLButtonElement>(null),
  };
  const [pillPos, setPillPos] = useState({ left: 0, width: 80 });

  useLayoutEffect(() => {
    const el = tabRefs[activeTab].current;
    if (el) {
      setPillPos({ left: el.offsetLeft, width: el.offsetWidth });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── New-posts polling ────────────────────────────────────────────────────
  const topPostIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (posts.length > 0) {
      topPostIdRef.current = posts[0].id;
      // Dismiss banner whenever feed refreshes
      if (bannerState !== 'hidden') setBannerState('hidden');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  useEffect(() => {
    const poll = async () => {
      // Skip when the tab is backgrounded — no point fetching posts the user can't see.
      if (document.hidden) return;
      try {
        const data = await communityApi.getFeed(0, 1);
        const latestId = data.posts?.[0]?.id;
        if (latestId && topPostIdRef.current !== null && latestId !== topPostIdRef.current) {
          setBannerState('visible');
        }
      } catch {
        // Ignore polling errors silently
      }
    };

    // Poll on a regular interval and also immediately when the tab regains focus
    // so users don't wait up to 90s to see the new-posts banner after switching back.
    const onVisibility = () => { if (!document.hidden) poll(); };
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(poll, NEW_POSTS_POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const pinnedPosts = posts.filter((p) => p.is_pinned);
  const boardPosts  = posts.filter((p) => !p.is_pinned && p.post_type !== 'prayer' && p.post_type !== 'challenge');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreatePost   = (body: string) => createPost('user', body);
  const handleCreatePrayer = (body: string, anonymous: boolean) => createPost('prayer', body, anonymous);

  // Reaction handlers — gate for unauthenticated visitors
  const handleAddReaction    = user ? addReaction    : () => navigate('/signup');
  const handleRemoveReaction = user ? removeReaction : () => {};

  const handleBannerClick = () => {
    setBannerState('dismissing');
    setTimeout(() => {
      reload();
      setBannerState('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const ptr = usePullToRefresh({ onRefresh: reload });

  return (
    <div
      style={{ maxWidth: 680, margin: '0 auto', padding: '0 1rem 2rem' }}
      onTouchStart={ptr.onTouchStart}
      onTouchMove={ptr.onTouchMove}
      onTouchEnd={ptr.onTouchEnd}
    >

      <PullRefreshIndicator progress={ptr.pullProgress} isRefreshing={ptr.isRefreshing} />

      {/* Tutorial overlay */}
      {showTutorial && <CommunityTutorial onDismiss={dismissTutorial} />}

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="community-hero">
        <div className="community-hero-icon">✝</div>
        <div>
          <h1 className="community-hero-title">
            {t('community.section.title', 'Community')}
          </h1>
          <p className="community-hero-tagline">
            {t('community.hero.tagline', 'Walk together in faith')}
          </p>
        </div>
        <button
          className="tap-target-44 ml-auto flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[var(--journal-text-muted)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-[var(--theme-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={openTutorial}
          aria-label={t('common.help', 'Help')}
          title={t('common.help', 'Help')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Admin compose panel */}
      {isAdmin && <AdminComposer onPublished={reload} />}

      {/* New-posts banner with slide-in / fade-out */}
      {bannerState !== 'hidden' && (
        <button
          onClick={handleBannerClick}
          className={bannerState === 'dismissing' ? 'new-posts-banner new-posts-banner-dismiss' : 'new-posts-banner'}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.75rem',
            background: 'var(--candle-amber)',
            color: '#1a1208',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {t('community.new_posts_banner', 'New posts — tap to refresh')}
        </button>
      )}

      {/* Walking Today stat */}
      <WalkingToday />

      {/* Pinned posts */}
      {pinnedPosts.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          {pinnedPosts.map((post, i) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              index={i}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              onDelete={post.is_self ? deletePost : undefined}
            />
          ))}
        </div>
      )}

      {/* ── Pill Tab Bar ─────────────────────────────────────────────────── */}
      <div className="community-tab-bar">
        {/* Sliding pill background */}
        <div
          className="community-tab-pill"
          style={{
            left: pillPos.left,
            width: pillPos.width,
          }}
        />
        {TAB_CONFIG.map(({ id, labelKey, fallback, Icon }) => (
          <button
            key={id}
            ref={tabRefs[id]}
            className={`community-tab-btn${activeTab === id ? ' community-tab-btn-active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={14} weight={activeTab === id ? 'duotone' : 'regular'} />
            {t(labelKey, fallback)}
          </button>
        ))}
      </div>

      {/* Board tab */}
      {activeTab === 'board' && (
        <>
          {error && boardPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'var(--grace-lavender)', marginBottom: '0.75rem' }}>{error}</p>
              <button className="btn btn-ghost btn-sm" onClick={reload}>
                {t('common.retry', 'Retry')}
              </button>
            </div>
          ) : isLoading && boardPosts.length === 0 ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => <CommunityPostSkeleton key={i} />)
          ) : boardPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🕯</div>
              <p style={{ color: 'var(--grace-lavender)', marginBottom: '1rem' }}>
                {t('community.empty.board', 'No reflections yet — be the first to share.')}
              </p>
              {user ? (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  {t('community.empty.shareReflection', '✍ Share your reflection')}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ background: 'var(--blessing-gold)', color: '#000' }}
                >
                  {t('nav.signup', 'Sign Up Free')}
                </button>
              )}
            </div>
          ) : (
            boardPosts.map((post, i) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                index={i}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                onDelete={post.is_self ? deletePost : undefined}
              />
            ))
          )}

          {hasMore && !isLoading && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={loadMore}
              style={{ display: 'block', margin: '0.75rem auto' }}
            >
              {t('common.load_more', 'Load more')}
            </button>
          )}

          <div ref={composerRef} style={{ marginTop: '1rem' }}>
            {user ? (
              <CommunityComposer isPremium={isPremium} onSubmit={handleCreatePost} />
            ) : (
              <div className="flex flex-col items-center gap-3 py-5 px-4 rounded-xl border border-amber-200/60 dark:border-amber-700/30 text-center">
                <p className="text-sm text-[var(--journal-text-muted)]">
                  {t('community.signUpToPost', 'Sign up free to share your reflection with the community.')}
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors"
                >
                  {t('nav.signup', 'Sign Up Free')}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Prayer Wall tab */}
      {activeTab === 'prayer' && (
        <PrayerWallTab
          posts={posts}
          isLoading={isLoading}
          onCreatePrayer={user ? handleCreatePrayer : async () => { navigate('/signup'); }}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onDelete={user ? deletePost : async () => {}}
        />
      )}

      {/* Challenges tab */}
      {activeTab === 'challenges' && (
        <ChallengesTab
          posts={posts}
          isLoading={isLoading}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
        />
      )}
    </div>
  );
};

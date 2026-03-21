import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareNetwork, DownloadSimple, Lock } from '@phosphor-icons/react';
import { useStreak } from '../../contexts/StreakContext';
import { useAuth } from '../../hooks/useAuth';
import { LockedFeatureCard } from '../../components/common/LockedFeatureCard';

const CARD_WIDTH = 600;
const CARD_HEIGHT = 315;

async function loadFont(): Promise<void> {
  if (typeof FontFace === 'undefined') return;
  try {
    const font = new FontFace(
      'Playfair Display',
      "url(https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.woff2)"
    );
    await font.load();
    document.fonts.add(font);
  } catch {
    // Fallback to system serif — non-fatal
  }
}

interface StreakShareCardProps {
  /** The user's current streak count */
  currentStreak: number;
  /** The user's highest earned milestone name (optional) */
  milestoneName?: string;
  /** Whether the current user is premium */
  isPremium: boolean;
}

export const StreakShareCard: React.FC<StreakShareCardProps> = ({
  currentStreak,
  milestoneName,
  isPremium,
}) => {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isPremium) {
    return (
      <LockedFeatureCard
        featureDescription={t(
          'streak.share_locked',
          'Upgrade to Premium to share your streak journey with others.'
        )}
      />
    );
  }

  const drawCard = async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    await loadFont();

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    // Background gradient using theme-aware colors
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--milestone-glow').trim() || '#1a1207';
    const gold = getComputedStyle(document.documentElement)
      .getPropertyValue('--blessing-gold').trim() || '#c9a84c';
    const parchment = getComputedStyle(document.documentElement)
      .getPropertyValue('--parchment').trim() || '#f5e6c8';

    const grad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    grad.addColorStop(0, bg || '#1a1207');
    grad.addColorStop(1, '#2d1f08');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Subtle border
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, CARD_WIDTH - 24, CARD_HEIGHT - 24);

    // App name (top-left)
    ctx.font = '600 18px "Playfair Display", serif';
    ctx.fillStyle = gold;
    ctx.textAlign = 'left';
    ctx.fillText('Words of Praise', 32, 50);

    // Streak count (large, centered)
    ctx.font = 'bold 80px "Playfair Display", serif';
    ctx.fillStyle = gold;
    ctx.textAlign = 'center';
    ctx.fillText(String(currentStreak), CARD_WIDTH / 2, 175);

    // "days in the Word" subtitle
    ctx.font = '400 24px "Playfair Display", serif';
    ctx.fillStyle = parchment;
    ctx.fillText(
      t('streak.share_subtitle', 'days in the Word'),
      CARD_WIDTH / 2,
      218
    );

    // Milestone name (if any)
    if (milestoneName) {
      ctx.font = 'italic 16px "Playfair Display", serif';
      ctx.fillStyle = gold;
      ctx.fillText(`"${milestoneName}"`, CARD_WIDTH / 2, 252);
    }

    // App URL (bottom-center)
    ctx.font = '400 14px sans-serif';
    ctx.fillStyle = parchment;
    ctx.globalAlpha = 0.6;
    ctx.fillText('wordsofpraise.app', CARD_WIDTH / 2, CARD_HEIGHT - 24);
    ctx.globalAlpha = 1;

    return canvas;
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const canvas = await drawCard();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `streak-${currentStreak}-days.png`, { type: 'image/png' });

        // Try Web Share API first
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${currentStreak} days in the Word`,
            });
            return;
          } catch {
            // User cancelled or API unavailable — fall through
          }
        }

        // Try clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          return;
        } catch {
          // Fall through to download
        }

        // Download fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Hidden canvas used for rendering — not visible to the user */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
      <button
        className="btn btn-primary btn-sm"
        onClick={handleShare}
        disabled={isGenerating}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ShareNetwork size={16} weight="bold" />
        {isGenerating
          ? t('streak.share_generating', 'Generating…')
          : t('streak.share_button', 'Share my streak')}
      </button>
    </div>
  );
};

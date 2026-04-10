import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from '@phosphor-icons/react';
import type { UserPlanProgressDetail } from '../../services/api/plans';

interface PlanCardProps {
  plan: UserPlanProgressDetail;
  onClick?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isComplete = !!plan.completed_at;
  const progress = plan.length_days > 0 ? (plan.last_read_day / plan.length_days) * 100 : 0;

  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (onClick) {
      onClick();
    } else {
      navigate(`/plans/${plan.slug}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-white dark:bg-gray-800/60 hover:bg-amber-50/60 dark:hover:bg-amber-900/20 transition-colors active:scale-[0.98] transition-transform"
      style={{ background: 'var(--card-bg)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-snug">{plan.title}</span>
        {isComplete && (
          <CheckCircle
            size={18}
            weight="fill"
            className="flex-shrink-0 mt-0.5"
            style={{ color: 'var(--blessing-gold)' }}
          />
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {isComplete
          ? t('plans.complete', 'Path Complete')
          : t('plans.dayOf', 'Day {{day}} of {{total}}', {
              day: plan.last_read_day + 1,
              total: plan.length_days,
            })}
      </p>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'var(--blessing-gold)',
          }}
        />
      </div>
    </button>
  );
};

export default PlanCard;

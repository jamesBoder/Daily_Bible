import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BookmarkSimple, ArrowRight } from '@phosphor-icons/react';
import plansApi from '../../services/api/plans';
import type { UserPlanProgressDetail } from '../../services/api/plans';

const PlanSettings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: myPlans } = useQuery({
    queryKey: ['plans-my'],
    queryFn: plansApi.getMyPlans,
  });

  const active = (myPlans?.enrollments ?? []).filter(e => !e.completed_at);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookmarkSimple size={16} style={{ color: 'var(--blessing-gold)' }} weight="fill" />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {t('plans.title', 'Reading Plans')}
          </span>
        </div>
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:opacity-75 transition-opacity"
        >
          {t('nav.plans', 'Browse Plans')}
          <ArrowRight size={12} />
        </button>
      </div>

      {active.length === 0 ? (
        <p className="text-xs text-[var(--journal-text-muted)] py-1">
          No active plans. <button onClick={() => navigate('/plans')} className="underline">Browse the library →</button>
        </p>
      ) : (
        <div className="space-y-2">
          {active.map(plan => (
            <MiniPlanCard key={plan.plan_id} plan={plan} onNavigate={() => navigate(`/plans/${plan.slug}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

interface MiniPlanCardProps {
  plan: UserPlanProgressDetail;
  onNavigate: () => void;
}

const MiniPlanCard: React.FC<MiniPlanCardProps> = ({ plan, onNavigate }) => {
  const { t } = useTranslation();
  const pct = plan.length_days > 0 ? Math.min((plan.last_read_day / plan.length_days) * 100, 100) : 0;

  return (
    <button
      onClick={onNavigate}
      className="w-full text-left p-3 rounded-xl border border-amber-100/60 dark:border-amber-900/30 active:scale-[0.98] transition-transform"
      style={{ background: 'var(--card-bg)' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[var(--foreground)] truncate flex-1 mr-2">{plan.title}</span>
        <span className="text-xs text-[var(--journal-text-muted)] flex-shrink-0">
          {t('plans.dayOf', 'Day {{day}} of {{total}}', { day: plan.last_read_day + 1, total: plan.length_days })}
        </span>
      </div>
      <div className="h-1 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--blessing-gold)' }}
        />
      </div>
    </button>
  );
};

export default PlanSettings;

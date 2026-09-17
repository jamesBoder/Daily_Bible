import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlanDayView from './PlanDayView';

// Thin route wrapper — PlanDayView fetches its own data from `slug` and only
// needs navigation callbacks. Giving it a real route (/plans/:slug/day) instead
// of toggling it via local state in PlanDetail means the browser back button
// works as expected while reading a plan day, and a day view can be linked to
// directly (e.g. from a push notification) instead of only reachable by tapping
// through the detail page first.
const PlanDayRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) return null;

  return (
    <PlanDayView
      slug={slug}
      onBack={() => navigate(`/plans/${slug}`)}
      onBackToLibrary={() => navigate('/plans')}
    />
  );
};

export default PlanDayRoute;

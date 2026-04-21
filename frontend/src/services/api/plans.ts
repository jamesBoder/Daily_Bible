import apiClient from './client';

export interface WordStudy {
  original: string;
  transliteration: string;
  definition: string;
  refs: string[];
}

export interface PrevDaySummary {
  verse_ref: string;
  day_title: string;
  journal_excerpt: string; // may be empty string
}

export interface QuizOption {
  label: string;
  text: string;
  correct: boolean;
}

export interface PlanProgressSummary {
  last_read_day: number;
  completed_at: string | null;
  is_active: boolean;
}

export interface ReadingPlanSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  length_days: number;
  is_seasonal: boolean;
  season_key: string;
  requires_premium: boolean;
  is_season_active: boolean;
  user_progress?: PlanProgressSummary;
}

export interface ReadingPlanEntry {
  id: number;
  day_number: number;
  day_title: string;         // e.g. "The Peace That Passes Understanding"; empty for legacy entries
  verse_ref: string;
  verse_text: string;        // seeded passage_text when present; falls back to verse DB lookup
  reflection: string;
  passage_refs: string;      // JSON array of extra refs, empty string when absent
  prayer: string;
  application: string;
  question: string;
  context_note: string;
  content_type: string;      // "verse" | "passage" | "psalm" | "chapter" | "meditation"
  is_memory_verse: boolean;
  quiz_question: string;     // empty string when no check for this day
  quiz_options: string;      // JSON QuizOption[]
  quiz_explanation: string;
  word_studies: string;      // JSON Record<string, WordStudy>; empty string when none
  deep_dive_text: string;    // extended commentary; empty string when section is hidden
  deep_dive_refs: string;    // JSON string[]; empty string when none
  prev_day?: PrevDaySummary; // previous day recap; absent on day 1 or if backend omits
}

export interface ReadingPlanDetail extends ReadingPlanSummary {
  entries: ReadingPlanEntry[];
}

export interface UserPlanProgressDetail {
  plan_id: number;
  slug: string;
  title: string;
  length_days: number;
  last_read_day: number;
  completed_at: string | null;
  enrolled_at: string;
}

export interface AdvanceResponse {
  progress: {
    id: number;
    user_id: number;
    plan_id: number;
    last_read_day: number;
    completed_at: string | null;
    is_active: boolean;
  };
  just_completed: boolean;
  blessings_earned: number;
}

const plansApi = {
  getLibrary: () =>
    apiClient.get<{ plans: ReadingPlanSummary[] }>('/api/plans').then(r => r.data.plans),

  getPlan: (slug: string) =>
    apiClient.get<ReadingPlanDetail>(`/api/plans/${slug}`).then(r => r.data),

  getMyPlans: () =>
    apiClient.get<{ enrollments: UserPlanProgressDetail[] }>('/api/plans/my').then(r => r.data.enrollments),

  getSeasonalCurrent: () =>
    apiClient.get<{ plan: ReadingPlanSummary | null }>('/api/plans/seasonal/current').then(r => r.data.plan),

  getTodayEntry: (slug: string) =>
    apiClient.get<ReadingPlanEntry>(`/api/plans/${slug}/today`).then(r => r.data),

  enroll: (slug: string) =>
    apiClient.post(`/api/plans/${slug}/enroll`).then(r => r.data),

  advance: (slug: string) =>
    apiClient.post<AdvanceResponse>(`/api/plans/${slug}/advance`).then(r => r.data),

  unenroll: (slug: string) =>
    apiClient.delete(`/api/plans/${slug}/unenroll`).then(r => r.data),
};

export default plansApi;

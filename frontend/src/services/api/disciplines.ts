import apiClient from './client'

export interface DisciplineStatus {
  key: string
  blessings: number
  completed: boolean
  requires_premium: boolean
}

export interface DisciplinesTodayResponse {
  disciplines: DisciplineStatus[]
  date: string              // UTC-10 date string — informational only
  enrolled_in_plan: boolean // drives "Start a plan →" CTA on advance_plan_day row
}

// Returned as an optional field in action responses when a discipline is newly completed.
export interface DisciplineCompleted {
  key: string
  blessings_credited: number
}

export interface DisciplineStat {
  key: string
  blessings: number
  requires_premium: boolean
  current_streak: number
  times_offered: number
  lifetime_completions: number
  lifetime_blessings_earned: number
  last_completed_date?: string
}

export interface HistoryDay {
  date: string
  offered: string[]
  completed: string[] // always empty for upcoming (future) days
}

export interface CurrentCycleProgress {
  completed_count: number
  offered_count: number
}

export interface DisciplineStatsResponse {
  stats: DisciplineStat[]
  recent: HistoryDay[]   // rolling last 14 calendar days, chronological order
  upcoming: HistoryDay[] // next 3 days
  current_cycle: CurrentCycleProgress
  perfect_cycles: number
  date: string
}

export const disciplinesApi = {
  getToday: (): Promise<DisciplinesTodayResponse> =>
    apiClient.get<DisciplinesTodayResponse>('/api/disciplines/today').then(r => r.data),

  getStats: (): Promise<DisciplineStatsResponse> =>
    apiClient.get<DisciplineStatsResponse>('/api/disciplines/stats').then(r => r.data),

  complete: (key: string): Promise<{ blessings_credited: number }> =>
    apiClient.post<{ blessings_credited: number }>(`/api/disciplines/${key}/complete`).then(r => r.data),
}

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

export const disciplinesApi = {
  getToday: (): Promise<DisciplinesTodayResponse> =>
    apiClient.get<DisciplinesTodayResponse>('/api/disciplines/today').then(r => r.data),

  complete: (key: string): Promise<{ blessings_credited: number }> =>
    apiClient.post<{ blessings_credited: number }>(`/api/disciplines/${key}/complete`).then(r => r.data),
}

import { useQuery } from '@tanstack/react-query'
import { disciplinesApi, DisciplineStatsResponse } from '../../services/api/disciplines'

export function useDisciplineStats() {
  return useQuery<DisciplineStatsResponse>({
    queryKey: ['disciplines', 'stats'],
    queryFn: disciplinesApi.getStats,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}

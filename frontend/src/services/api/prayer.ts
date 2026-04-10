import apiClient from './client';

export interface RosaryCompleteResponse {
  message: string;
  blessings_earned: number;
}

const prayerApi = {
  completeRosary: (mysterySet: string): Promise<RosaryCompleteResponse> =>
    apiClient.post<RosaryCompleteResponse>('/api/prayer/rosary/complete', { mystery_set: mysterySet })
      .then(r => r.data),
};

export default prayerApi;

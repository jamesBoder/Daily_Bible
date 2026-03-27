import apiClient from './client';

interface PushSubscribePayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const pushApi = {
  getVapidPublicKey: () =>
    apiClient.get<{ public_key: string }>('/api/push/vapid-key'),

  subscribe: (payload: PushSubscribePayload) =>
    apiClient.post('/api/push/subscribe', payload),

  unsubscribe: (endpoint: string) =>
    apiClient.post('/api/push/unsubscribe', { endpoint }),
};

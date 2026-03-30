import { useState, useEffect, useCallback } from 'react';
import { pushApi } from '../services/api/push';

export type PushPermission = 'unsupported' | 'default' | 'granted' | 'denied';

export interface UsePushNotificationsReturn {
  /** Whether the browser supports Web Push at all */
  isSupported: boolean;
  /** Current Notification.permission state */
  permission: PushPermission;
  /** True once the user has an active push subscription synced to the server */
  subscribed: boolean;
  /** True while an async subscribe/unsubscribe operation is in flight */
  loading: boolean;
  /** Request permission and subscribe to push notifications */
  subscribe: () => Promise<void>;
  /** Unsubscribe and remove the subscription from the server */
  unsubscribe: () => Promise<void>;
}

/**
 * Converts a URL-safe Base64 VAPID public key to the Uint8Array expected by
 * PushManager.subscribe({ applicationServerKey }).
 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const [permission, setPermission] = useState<PushPermission>(
    isSupported ? (Notification.permission as PushPermission) : 'unsupported'
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // On mount: read current permission + check for an existing subscription.
  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission as PushPermission);

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {
        // SW not yet active (first load) — treat as not subscribed
        setSubscribed(false);
      });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;
    setLoading(true);
    let browserSub: PushSubscription | null = null;
    try {
      // 1. Fetch VAPID public key from backend.
      const { data } = await pushApi.getVapidPublicKey();
      const appServerKey = urlBase64ToUint8Array(data.public_key);

      // 2. Ask the user for Notification permission.
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== 'granted') return;

      // 3. Subscribe via the browser PushManager.
      const reg = await navigator.serviceWorker.ready;
      browserSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });

      // 4. Send the subscription keys to the backend.
      //    If this fails, roll back the browser subscription so the UI stays
      //    consistent and the user can try again cleanly.
      const json = browserSub.toJSON();
      await pushApi.subscribe({
        endpoint: browserSub.endpoint,
        p256dh:   json.keys?.p256dh ?? '',
        auth:     json.keys?.auth ?? '',
      });

      setSubscribed(true);
    } catch (err) {
      console.error('[usePushNotifications] subscribe failed:', err);
      // Roll back the browser subscription if backend save failed
      if (browserSub) {
        browserSub.unsubscribe().catch(() => {});
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Tell the backend first so it can clean up its record.
        await pushApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error('[usePushNotifications] unsubscribe failed:', err);
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  return { isSupported, permission, subscribed, loading, subscribe, unsubscribe };
}

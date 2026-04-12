import React, { createContext, useContext, useEffect, useState } from 'react';

const INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const IOS_GUIDE_DISMISSED_KEY = 'pwa-ios-guide-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPromptContextValue {
  /** Android/Chrome: beforeinstallprompt captured and user hasn't dismissed this session */
  canInstall: boolean;
  /** True when running as an installed PWA (display-mode: standalone) */
  isInstalled: boolean;
  /** True on iOS Safari where beforeinstallprompt never fires */
  isIOS: boolean;
  /** Trigger the native Android install prompt */
  install: () => Promise<void>;
  /** Hide the Android auto-banner for the rest of this session */
  dismiss: () => void;
  /** True when the iOS guide modal has been permanently dismissed */
  iosGuideDismissed: boolean;
  /** Permanently dismiss the iOS install guide modal */
  dismissIOSGuide: () => void;
}

const InstallPromptContext = createContext<InstallPromptContextValue>({
  canInstall: false,
  isInstalled: false,
  isIOS: false,
  install: async () => {},
  dismiss: () => {},
  iosGuideDismissed: false,
  dismissIOSGuide: () => {},
});

export const InstallPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [iosGuideDismissed, setIosGuideDismissed] = useState(
    () => !!localStorage.getItem(IOS_GUIDE_DISMISSED_KEY)
  );

  // iPadOS 13+ reports 'MacIntel' with maxTouchPoints > 1 — detect that too
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;

  useEffect(() => {
    // Already dismissed this session — don't show the Android auto-banner again
    if (sessionStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredEvent(prompt);
      // Set canInstall immediately — the component decides when to surface the prompt
      // based on the streak condition rather than a view-count threshold.
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Hide the prompt once the OS reports the app was installed
  useEffect(() => {
    const handler = () => setCanInstall(false);
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const install = async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredEvent(null);
    }
  };

  const dismiss = () => {
    setCanInstall(false);
    sessionStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  };

  const dismissIOSGuide = () => {
    setIosGuideDismissed(true);
    localStorage.setItem(IOS_GUIDE_DISMISSED_KEY, '1');
  };

  return (
    <InstallPromptContext.Provider value={{ canInstall, isInstalled, isIOS, install, dismiss, iosGuideDismissed, dismissIOSGuide }}>
      {children}
    </InstallPromptContext.Provider>
  );
};

export const useInstallPromptContext = () => useContext(InstallPromptContext);

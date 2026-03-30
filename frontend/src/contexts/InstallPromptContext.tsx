import React, { createContext, useContext, useEffect, useState } from 'react';

const INSTALL_TRIGGER_VIEWS = 3;
const INSTALL_VIEW_KEY = 'pwa-verse-views';
const INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPromptContextValue {
  /** Android/Chrome: beforeinstallprompt is captured and view threshold met */
  canInstall: boolean;
  /** True when running as an installed PWA (display-mode: standalone) */
  isInstalled: boolean;
  /** True on iOS Safari where beforeinstallprompt never fires */
  isIOS: boolean;
  /** Trigger the native Android install prompt */
  install: () => Promise<void>;
  /** Hide the auto-banner for the rest of this session */
  dismiss: () => void;
}

const InstallPromptContext = createContext<InstallPromptContextValue>({
  canInstall: false,
  isInstalled: false,
  isIOS: false,
  install: async () => {},
  dismiss: () => {},
});

export const InstallPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // iPadOS 13+ reports 'MacIntel' with maxTouchPoints > 1 — detect that too
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;

  useEffect(() => {
    // Already dismissed this session — don't show the auto-banner again
    if (sessionStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredEvent(prompt);

      const views = parseInt(localStorage.getItem(INSTALL_VIEW_KEY) ?? '0', 10) + 1;
      localStorage.setItem(INSTALL_VIEW_KEY, String(views));
      if (views >= INSTALL_TRIGGER_VIEWS) {
        setCanInstall(true);
      }
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

  return (
    <InstallPromptContext.Provider value={{ canInstall, isInstalled, isIOS, install, dismiss }}>
      {children}
    </InstallPromptContext.Provider>
  );
};

export const useInstallPromptContext = () => useContext(InstallPromptContext);

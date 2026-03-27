import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInstallPromptContext } from '../../contexts/InstallPromptContext';
import {
  DeviceMobile,
  CheckCircle,
  CaretDown,
  CaretUp,
  ShareNetwork,
  PlusSquare,
} from '@phosphor-icons/react';

/**
 * Settings section for installing the PWA.
 *
 * - Already installed → "Already on your home screen" confirmation row
 * - Android/Chrome with deferred prompt → "Install App" button
 * - iOS Safari → expandable step-by-step instructions
 * - Any other browser → generic install hint
 */
const InstallAppSection: React.FC = () => {
  const { t } = useTranslation();
  const { canInstall, isInstalled, isIOS, install } = useInstallPromptContext();
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  // Running as installed PWA
  if (isInstalled) {
    return (
      <div className="flex items-center gap-3 py-2">
        <CheckCircle size={22} weight="fill" className="text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('pwa.settings.installed', 'Already on your home screen')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('pwa.settings.installedDesc', "You're using the installed app.")}
          </p>
        </div>
      </div>
    );
  }

  // Android / Chrome — native prompt available
  if (canInstall) {
    return (
      <div className="flex items-center gap-3 py-2">
        <DeviceMobile size={22} weight="duotone" className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('pwa.settings.androidTitle', 'Add to Home Screen')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('pwa.settings.androidDesc', 'Instant access, even offline.')}
          </p>
        </div>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors disabled:opacity-60"
        >
          {installing
            ? t('common.loading', 'Loading…')
            : t('pwa.settings.androidCta', 'Install')}
        </button>
      </div>
    );
  }

  // iOS Safari — manual steps
  if (isIOS) {
    return (
      <div className="py-2">
        <button
          onClick={() => setIosGuideOpen(o => !o)}
          className="flex items-center gap-3 w-full text-left focus:outline-none"
          aria-expanded={iosGuideOpen}
        >
          <DeviceMobile size={22} weight="duotone" className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {t('pwa.settings.iosTitle', 'Add to Home Screen')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t('pwa.settings.iosDesc', 'Open instantly from your home screen.')}
            </p>
          </div>
          {iosGuideOpen
            ? <CaretUp size={16} className="text-gray-400 flex-shrink-0" />
            : <CaretDown size={16} className="text-gray-400 flex-shrink-0" />}
        </button>

        {iosGuideOpen && (
          <ol className="mt-3 ml-2 space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
              <span className="flex items-center gap-1.5">
                {t('pwa.settings.iosStep1', 'Tap the')}
                <ShareNetwork size={15} weight="bold" className="text-blue-500 inline flex-shrink-0" />
                <strong>{t('pwa.settings.iosStep1Share', 'Share')}</strong>
                {t('pwa.settings.iosStep1After', 'button at the bottom of Safari')}
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
              <span className="flex items-center gap-1.5">
                {t('pwa.settings.iosStep2', 'Scroll down and tap')}
                <PlusSquare size={15} weight="bold" className="text-blue-500 inline flex-shrink-0" />
                <strong>{t('pwa.settings.iosStep2AddToHome', '"Add to Home Screen"')}</strong>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
              <span>
                {t('pwa.settings.iosStep3', 'Tap')} <strong>{t('pwa.settings.iosStep3Add', '"Add"')}</strong> {t('pwa.settings.iosStep3After', 'in the top-right corner')}
              </span>
            </li>
          </ol>
        )}
      </div>
    );
  }

  // Desktop or unsupported browser — generic hint
  return (
    <div className="flex items-center gap-3 py-2">
      <DeviceMobile size={22} weight="duotone" className="text-gray-400 flex-shrink-0" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('pwa.settings.genericHint', 'Open this app in Chrome on Android or Safari on iPhone to add it to your home screen.')}
      </p>
    </div>
  );
};

export default InstallAppSection;

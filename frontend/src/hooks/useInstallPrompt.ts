import { useInstallPromptContext } from '../contexts/InstallPromptContext';

export interface UseInstallPromptReturn {
  canInstall: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Thin wrapper around InstallPromptContext.
 * The context owns the beforeinstallprompt listener so only one instance
 * ever captures the event, regardless of how many components call this hook.
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const { canInstall, install, dismiss } = useInstallPromptContext();
  return { canInstall, install, dismiss };
}

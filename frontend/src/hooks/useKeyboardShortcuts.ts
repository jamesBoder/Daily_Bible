import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, shift, alt, callback }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          (!ctrl || event.ctrlKey || event.metaKey) &&
          (!shift || event.shiftKey) &&
          (!alt || event.altKey)
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
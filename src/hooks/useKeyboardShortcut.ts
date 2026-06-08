import { useEffect, useRef } from 'react';

interface ShortcutMap {
  [key: string]: (e: KeyboardEvent) => void;
}

export function useKeyboardShortcut(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey || e.metaKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
      const callback = shortcutsRef.current[key];
      if (callback) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

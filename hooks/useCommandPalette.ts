import { useState, useEffect, useCallback } from 'react';

/**
 * Global hook to control the Command Palette from any component.
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(open => !open), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === '/') {
        // Only trigger if not in an input/textarea
        if (
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          open();
        }
      }
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

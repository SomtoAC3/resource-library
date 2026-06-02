"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "stash_home_pins";

export interface PinEntry {
  id: string;
  x: number;
  y: number;
}

export function usePins(defaultIds: string[] = []) {
  const [pins, setPins] = useState<PinEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setPins(JSON.parse(raw));
      } else if (defaultIds.length > 0) {
        // First visit: seed with default IDs at sentinel positions
        const defaults = defaultIds.slice(0, 6).map(id => ({ id, x: -1, y: -1 }));
        setPins(defaults);
        localStorage.setItem(KEY, JSON.stringify(defaults));
      }
    } catch {}
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((next: PinEntry[]) => {
    setPins(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addPin = useCallback((id: string) => {
    setPins(prev => {
      if (prev.some(p => p.id === id)) return prev;
      const next = [...prev, { id, x: -1, y: -1 }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removePin = useCallback((id: string) => {
    setPins(prev => {
      const next = prev.filter(p => p.id !== id);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setPins(prev => {
      const next = prev.map(p => p.id === id ? { ...p, x, y } : p);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isPinned = useCallback((id: string) => pins.some(p => p.id === id), [pins]);

  return { pins, ready, addPin, removePin, updatePosition, isPinned, persist };
}

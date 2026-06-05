"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "stash_board";

interface BoardData {
  pinnedIds: string[];                           // IDs explicitly pinned to the homepage
  initialized: boolean;                          // false = first session, auto-init with latest 6
  positions: Record<string, { x: number; y: number }>; // saved drag positions
}

const empty: BoardData = { pinnedIds: [], initialized: false, positions: {} };

function load(): BoardData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch { return empty; }
}

function save(data: BoardData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function useBoard() {
  const [data, setData] = useState<BoardData>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => { setData(load()); setReady(true); }, []);

  const update = useCallback((fn: (prev: BoardData) => BoardData) => {
    setData(prev => { const next = fn(prev); save(next); return next; });
  }, []);

  // Called once on first session to seed the default 6 latest pins
  const initialize = useCallback((ids: string[]) => {
    update(d => ({ ...d, pinnedIds: ids, initialized: true }));
  }, [update]);

  const pin = useCallback((id: string) => {
    update(d => ({
      ...d,
      pinnedIds: [...new Set([...d.pinnedIds, id])],
      initialized: true,
    }));
  }, [update]);

  const unpin = useCallback((id: string) => {
    update(d => ({
      ...d,
      pinnedIds: d.pinnedIds.filter(p => p !== id),
      initialized: true,
    }));
  }, [update]);

  const savePosition = useCallback((id: string, x: number, y: number) => {
    update(d => ({ ...d, positions: { ...d.positions, [id]: { x, y } } }));
  }, [update]);

  const isOnHomepage = useCallback((id: string) => data.pinnedIds.includes(id), [data.pinnedIds]);
  const getPosition = useCallback((id: string) => data.positions[id] ?? null, [data.positions]);

  return {
    ready,
    initialized: data.initialized,
    pin,
    unpin,
    initialize,
    isOnHomepage,
    getPosition,
    savePosition,
  };
}

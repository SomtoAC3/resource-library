"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "stash_board";

interface BoardData {
  hidden: string[];                              // IDs removed from home board
  homepageIds: string[];                         // IDs currently visible on the homepage board
  positions: Record<string, { x: number; y: number }>; // saved drag positions
}

const empty: BoardData = { hidden: [], homepageIds: [], positions: {} };

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

  const hide = useCallback((id: string) => {
    update(d => ({
      ...d,
      hidden: [...new Set([...d.hidden, id])],
      homepageIds: d.homepageIds.filter(h => h !== id),
    }));
  }, [update]);

  const show = useCallback((id: string) => {
    update(d => ({ ...d, hidden: d.hidden.filter(h => h !== id) }));
  }, [update]);

  const savePosition = useCallback((id: string, x: number, y: number) => {
    update(d => ({ ...d, positions: { ...d.positions, [id]: { x, y } } }));
  }, [update]);

  const isHidden = useCallback((id: string) => data.hidden.includes(id), [data.hidden]);
  const getPosition = useCallback((id: string) => data.positions[id] ?? null, [data.positions]);

  const setHomepageIds = useCallback((ids: string[]) => {
    update(d => ({ ...d, homepageIds: ids }));
  }, [update]);

  const isOnHomepage = useCallback((id: string) => data.homepageIds.includes(id), [data.homepageIds]);

  return { ready, hide, show, isHidden, getPosition, savePosition, setHomepageIds, isOnHomepage };
}

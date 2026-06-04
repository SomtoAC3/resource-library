"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "stash_board";

interface BoardData {
  hidden: string[];                              // IDs removed from home board (used for seeding)
  positions: Record<string, { x: number; y: number }>; // saved drag positions
  boardPins: string[];                           // explicit list of IDs shown on homepage board
}

const empty: BoardData = { hidden: [], positions: {}, boardPins: [] };

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

  const savePosition = useCallback((id: string, x: number, y: number) => {
    update(d => ({ ...d, positions: { ...d.positions, [id]: { x, y } } }));
  }, [update]);

  // Called once on first homepage visit to seed boardPins from the exclusion model
  const initBoardPins = useCallback((ids: string[]) => {
    update(d => d.boardPins.length > 0 ? d : { ...d, boardPins: ids });
  }, [update]);

  const addToBoard = useCallback((id: string) => {
    update(d => ({ ...d, boardPins: [...new Set([...d.boardPins, id])] }));
  }, [update]);

  const removeFromBoard = useCallback((id: string) => {
    update(d => ({ ...d, boardPins: d.boardPins.filter(p => p !== id) }));
  }, [update]);

  const isOnBoard = useCallback((id: string) => data.boardPins.includes(id), [data.boardPins]);
  const getPosition = useCallback((id: string) => data.positions[id] ?? null, [data.positions]);

  return { ready, boardPins: data.boardPins, isOnBoard, initBoardPins, addToBoard, removeFromBoard, getPosition, savePosition };
}

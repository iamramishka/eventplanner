'use client';

import { useEffect, useState } from 'react';

const KEY = 'shortlist_vendors';

function read() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!raw) return [] as string[];
    return JSON.parse(raw) as string[];
  } catch {
    return [] as string[];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export default function useShortlist() {
  const [list, setList] = useState<string[]>(() => (typeof window !== 'undefined' ? read() : []));

  useEffect(() => {
    const onStorage = () => setList(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = (id: string) => {
    setList(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      write(next);
      return next;
    });
  };

  const remove = (id: string) => {
    setList(prev => {
      const next = prev.filter(x => x !== id);
      write(next);
      return next;
    });
  };

  const toggle = (id: string) => {
    setList(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(x => x !== id) : [...prev, id];
      write(next);
      return next;
    });
  };

  const isSaved = (id: string) => list.includes(id);

  return { list, add, remove, toggle, isSaved };
}

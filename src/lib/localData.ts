'use client';

/**
 * Local storage data layer for the app.
 * Stores all goals and accounts in a single JSON blob in localStorage.
 * Also exposes backup/restore helpers to move data between devices.
 */

const STORAGE_KEY = 'goals-accounts-data-v1';

export type GoalType = 'short-term' | 'long-term';
export type GoalStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  type: GoalType;
  deadline?: string; // ISO date string
  status: GoalStatus;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export type AccountType = 'incoming' | 'outgoing';

export interface Account {
  _id: string;
  personName: string;
  amount: number;
  phone?: string;
  type: AccountType;
  notes?: string;
  date: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface AppData {
  goals: Goal[];
  accounts: Account[];
  createdAt: string;
  updatedAt: string;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createEmptyData(): AppData {
  const now = new Date().toISOString();
  return {
    goals: [],
    accounts: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Read full app data from localStorage (safe fallback if unavailable). */
export function readData(): AppData {
  if (!isBrowser()) {
    return createEmptyData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || !Array.isArray(parsed.goals) || !Array.isArray(parsed.accounts)) {
      return createEmptyData();
    }
    return {
      ...createEmptyData(),
      ...parsed,
      goals: parsed.goals ?? [],
      accounts: parsed.accounts ?? [],
    };
  } catch {
    return createEmptyData();
  }
}

/** Persist full app data to localStorage. */
export function writeData(data: AppData): void {
  if (!isBrowser()) return;
  const toSave: AppData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

/** Generate a simple unique id for local entities. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/** Export current app data as a JSON string for backup. */
export function backupData(): string {
  const data = readData();
  return JSON.stringify(data, null, 2);
}

/** Restore app data from JSON string (throws on invalid structure). */
export function restoreData(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>;
  if (!parsed || !Array.isArray(parsed.goals) || !Array.isArray(parsed.accounts)) {
    throw new Error('ملف النسخ الاحتياطي غير صالح');
  }
  const now = new Date().toISOString();
  const data: AppData = {
    createdAt: parsed.createdAt || now,
    updatedAt: now,
    goals: parsed.goals,
    accounts: parsed.accounts,
  };
  writeData(data);
  return data;
}


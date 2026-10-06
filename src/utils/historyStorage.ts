/**
 * Local storage history for LinkQR (Generated & Scanned codes)
 */

export interface HistoryItem {
  id: string;
  type: 'generated' | 'scanned';
  content: string;
  isUrl: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'linkqr_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  const current = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  // Filter out immediate duplicate of same content
  const filtered = current.filter(i => !(i.content === item.content && i.type === item.type));
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }

  return newItem;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }
}

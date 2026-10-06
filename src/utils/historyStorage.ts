/**
 * Local storage history for LinkQR (Generated & Scanned codes)
 * 100% private to the user's browser; never transmitted over the network.
 */

export interface HistoryItem {
  id: string;
  type: 'generated' | 'scanned';
  content: string;
  isUrl: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'linkqr_history_v1';
const MAX_HISTORY_ITEMS = 40;

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

  // Filter out immediate duplicate of same content and type
  const filtered = current.filter(i => !(i.content === item.content && i.type === item.type));
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save history to localStorage:', e);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const current = getHistory();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete history item from localStorage:', e);
  }
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear history from localStorage:', e);
  }
}

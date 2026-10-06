import { describe, it, expect, beforeEach } from 'vitest';
import { getHistory, saveHistoryItem, deleteHistoryItem, clearHistory } from './historyStorage';

describe('historyStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no history exists', () => {
    expect(getHistory()).toEqual([]);
  });

  it('saves and retrieves generated item', () => {
    const item = saveHistoryItem({
      type: 'generated',
      content: 'https://qr.feminismindia.com',
      isUrl: true,
    });

    expect(item.id).toBeDefined();
    expect(item.content).toBe('https://qr.feminismindia.com');
    expect(item.type).toBe('generated');

    const history = getHistory();
    expect(history.length).toBe(1);
    expect(history[0].content).toBe('https://qr.feminismindia.com');
  });

  it('deduplicates identical consecutive items and updates ordering', () => {
    saveHistoryItem({
      type: 'generated',
      content: 'https://qr.feminismindia.com',
      isUrl: true,
    });
    saveHistoryItem({
      type: 'generated',
      content: 'https://github.com',
      isUrl: true,
    });
    // Re-save first URL
    saveHistoryItem({
      type: 'generated',
      content: 'https://qr.feminismindia.com',
      isUrl: true,
    });

    const history = getHistory();
    expect(history.length).toBe(2);
    expect(history[0].content).toBe('https://qr.feminismindia.com');
    expect(history[1].content).toBe('https://github.com');
  });

  it('deletes an individual history item by id', () => {
    const item1 = saveHistoryItem({
      type: 'generated',
      content: 'https://qr.feminismindia.com',
      isUrl: true,
    });
    const item2 = saveHistoryItem({
      type: 'scanned',
      content: 'https://wikipedia.org',
      isUrl: true,
    });

    expect(getHistory().length).toBe(2);
    deleteHistoryItem(item1.id);

    const remaining = getHistory();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(item2.id);
  });

  it('clears all history items', () => {
    saveHistoryItem({
      type: 'scanned',
      content: 'https://example.com',
      isUrl: true,
    });
    expect(getHistory().length).toBe(1);
    clearHistory();
    expect(getHistory().length).toBe(0);
  });
});

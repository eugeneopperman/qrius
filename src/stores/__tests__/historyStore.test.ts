import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useHistoryStore, getTypeLabel, getDataSummary } from '../historyStore';
import type { QRStyleOptions, QRData } from '@/types';

const defaultStyle: QRStyleOptions = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersDotType: 'square',
  errorCorrectionLevel: 'H',
};

function makeEntry(overrides?: Partial<{ type: string; data: QRData; qrValue: string }>) {
  return {
    type: (overrides?.type ?? 'url') as 'url',
    data: overrides?.data ?? { type: 'url' as const, data: { url: 'https://example.com' } },
    styleOptions: defaultStyle,
    qrValue: overrides?.qrValue ?? 'https://example.com',
  };
}

describe('historyStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset store
    useHistoryStore.setState({
      entries: [],
      _clearedEntries: null,
      _undoTimeoutId: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addEntry', () => {
    it('adds an entry with generated id and timestamp', () => {
      useHistoryStore.getState().addEntry(makeEntry());

      const entries = useHistoryStore.getState().entries;
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBeTruthy();
      expect(entries[0].timestamp).toBeGreaterThan(0);
      expect(entries[0].type).toBe('url');
    });

    it('adds new entries at the beginning', () => {
      useHistoryStore.getState().addEntry(makeEntry({ qrValue: 'first' }));
      useHistoryStore.getState().addEntry(makeEntry({ qrValue: 'second' }));

      const entries = useHistoryStore.getState().entries;
      expect(entries[0].qrValue).toBe('second');
      expect(entries[1].qrValue).toBe('first');
    });

    it('limits entries to 20', () => {
      for (let i = 0; i < 25; i++) {
        useHistoryStore.getState().addEntry(makeEntry({ qrValue: `entry-${i}` }));
      }

      expect(useHistoryStore.getState().entries).toHaveLength(20);
    });
  });

  describe('removeEntry', () => {
    it('removes entry by id', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      const id = useHistoryStore.getState().entries[0].id;

      useHistoryStore.getState().removeEntry(id);

      expect(useHistoryStore.getState().entries).toHaveLength(0);
    });

    it('does nothing for non-existent id', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      useHistoryStore.getState().removeEntry('non-existent');
      expect(useHistoryStore.getState().entries).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('clears all entries', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      useHistoryStore.getState().addEntry(makeEntry());

      useHistoryStore.getState().clearHistory();

      expect(useHistoryStore.getState().entries).toHaveLength(0);
    });

    it('stores cleared entries for undo', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      useHistoryStore.getState().clearHistory();

      expect(useHistoryStore.getState()._clearedEntries).toHaveLength(1);
    });
  });

  describe('undoClear', () => {
    it('restores cleared entries', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      useHistoryStore.getState().clearHistory();

      const result = useHistoryStore.getState().undoClear();

      expect(result).toBe(true);
      expect(useHistoryStore.getState().entries).toHaveLength(1);
      expect(useHistoryStore.getState()._clearedEntries).toBeNull();
    });

    it('returns false when nothing to undo', () => {
      const result = useHistoryStore.getState().undoClear();
      expect(result).toBe(false);
    });
  });

  describe('canUndo', () => {
    it('returns false initially', () => {
      expect(useHistoryStore.getState().canUndo()).toBe(false);
    });

    it('returns true after clear', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      useHistoryStore.getState().clearHistory();
      expect(useHistoryStore.getState().canUndo()).toBe(true);
    });

    it('returns false after undo expires', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      useHistoryStore.getState().clearHistory();

      vi.advanceTimersByTime(10001);

      expect(useHistoryStore.getState().canUndo()).toBe(false);
    });
  });

  describe('getEntry', () => {
    it('finds entry by id', () => {
      useHistoryStore.getState().addEntry(makeEntry({ qrValue: 'test' }));
      const id = useHistoryStore.getState().entries[0].id;

      expect(useHistoryStore.getState().getEntry(id)?.qrValue).toBe('test');
    });

    it('returns undefined for unknown id', () => {
      expect(useHistoryStore.getState().getEntry('nope')).toBeUndefined();
    });
  });

  describe('updateThumbnail', () => {
    it('updates the thumbnail for an entry', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      const id = useHistoryStore.getState().entries[0].id;

      useHistoryStore.getState().updateThumbnail(id, 'data:image/png;base64,abc');

      expect(useHistoryStore.getState().entries[0].thumbnail).toBe('data:image/png;base64,abc');
    });
  });

  describe('updateEntry', () => {
    it('updates arbitrary fields on an entry', () => {
      useHistoryStore.getState().addEntry(makeEntry());
      const id = useHistoryStore.getState().entries[0].id;

      useHistoryStore.getState().updateEntry(id, { totalScans: 42 });

      expect(useHistoryStore.getState().entries[0].totalScans).toBe(42);
    });
  });
});

describe('getTypeLabel', () => {
  it('returns human-readable labels', () => {
    expect(getTypeLabel('url')).toBe('URL');
    expect(getTypeLabel('wifi')).toBe('WiFi');
    expect(getTypeLabel('vcard')).toBe('vCard');
    expect(getTypeLabel('event')).toBe('Event');
  });
});

describe('getDataSummary', () => {
  it('returns URL data summary', () => {
    expect(getDataSummary({ type: 'url', data: { url: 'https://x.com' } })).toBe('https://x.com');
  });

  it('returns text data summary truncated to 50 chars', () => {
    const longText = 'a'.repeat(100);
    expect(getDataSummary({ type: 'text', data: { text: longText } })).toBe('a'.repeat(50));
  });

  it('returns email', () => {
    expect(getDataSummary({ type: 'email', data: { email: 'a@b.com' } })).toBe('a@b.com');
  });

  it('returns phone for sms', () => {
    expect(getDataSummary({ type: 'sms', data: { phone: '+1234' } })).toBe('+1234');
  });

  it('returns ssid for wifi', () => {
    expect(getDataSummary({ type: 'wifi', data: { ssid: 'MyNet', encryption: 'WPA' as const } })).toBe('MyNet');
  });

  it('returns full name for vcard', () => {
    expect(getDataSummary({ type: 'vcard', data: { firstName: 'John', lastName: 'Doe' } })).toBe('John Doe');
  });

  it('returns coordinates for location', () => {
    expect(getDataSummary({ type: 'location', data: { latitude: '40.7', longitude: '-74.0' } })).toBe('40.7, -74.0');
  });

  it('handles empty fields gracefully', () => {
    expect(getDataSummary({ type: 'url', data: { url: '' } })).toBe('Empty URL');
    expect(getDataSummary({ type: 'event', data: { title: '', startDate: '' } })).toBe('Empty event');
  });
});

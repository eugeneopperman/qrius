import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToastStore, toast } from '../toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset store state before each test
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addToast', () => {
    it('adds a toast to the store', () => {
      const id = useToastStore.getState().addToast({
        type: 'success',
        message: 'Test message',
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        id,
        type: 'success',
        message: 'Test message',
      });
    });

    it('returns a unique id for each toast', () => {
      const id1 = useToastStore.getState().addToast({
        type: 'success',
        message: 'First',
      });
      const id2 = useToastStore.getState().addToast({
        type: 'info',
        message: 'Second',
      });

      expect(id1).not.toBe(id2);
    });

    it('uses default duration of 4000ms', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test',
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(4000);
    });

    it('respects custom duration', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test',
        duration: 10000,
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(10000);
    });

    it('auto-removes toast after duration', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test',
        duration: 3000,
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(3000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('does not auto-remove toast with duration 0', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Permanent',
        duration: 0,
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(10000);

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('removeToast', () => {
    it('removes a specific toast by id', () => {
      const id1 = useToastStore.getState().addToast({
        type: 'success',
        message: 'First',
      });
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Second',
      });

      expect(useToastStore.getState().toasts).toHaveLength(2);

      useToastStore.getState().removeToast(id1);

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Second');
    });

    it('does nothing for non-existent id', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test',
      });

      useToastStore.getState().removeToast('non-existent');

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('clearToasts', () => {
    it('removes all toasts', () => {
      useToastStore.getState().addToast({ type: 'success', message: '1' });
      useToastStore.getState().addToast({ type: 'error', message: '2' });
      useToastStore.getState().addToast({ type: 'info', message: '3' });

      expect(useToastStore.getState().toasts).toHaveLength(3);

      useToastStore.getState().clearToasts();

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('toast helpers', () => {
    it('toast.success creates a success toast', () => {
      toast.success('Success message');

      const { toasts } = useToastStore.getState();
      expect(toasts[0]).toMatchObject({
        type: 'success',
        message: 'Success message',
      });
    });

    it('toast.error creates an error toast', () => {
      toast.error('Error message');

      const { toasts } = useToastStore.getState();
      expect(toasts[0]).toMatchObject({
        type: 'error',
        message: 'Error message',
      });
    });

    it('toast.info creates an info toast', () => {
      toast.info('Info message');

      const { toasts } = useToastStore.getState();
      expect(toasts[0]).toMatchObject({
        type: 'info',
        message: 'Info message',
      });
    });

    it('toast.warning creates a warning toast', () => {
      toast.warning('Warning message');

      const { toasts } = useToastStore.getState();
      expect(toasts[0]).toMatchObject({
        type: 'warning',
        message: 'Warning message',
      });
    });

    it('toast helpers accept custom duration', () => {
      toast.success('Test', 5000);

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(5000);
    });
  });
});

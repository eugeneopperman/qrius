/**
 * Test setup file for Vitest
 * This file runs before each test file
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}

window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
    write: vi.fn().mockResolvedValue(undefined),
    read: vi.fn().mockResolvedValue([]),
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Suppress console errors in tests (optional, remove if you want to see them)
// vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock FileReader
class FileReaderMock {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  onload: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onerror: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onloadend: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onloadstart: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onprogress: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onabort: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
  EMPTY = 0;
  LOADING = 1;
  DONE = 2;

  abort = vi.fn();
  readAsArrayBuffer = vi.fn();
  readAsBinaryString = vi.fn();
  readAsText = vi.fn();
  readAsDataURL = vi.fn().mockImplementation(function (this: FileReaderMock) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mock';
      if (this.onloadend) {
        this.onloadend({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }, 0);
  });
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

window.FileReader = FileReaderMock as unknown as typeof FileReader;

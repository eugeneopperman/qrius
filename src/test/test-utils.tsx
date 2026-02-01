/**
 * Test utilities for rendering components with providers
 */

import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement, type PropsWithChildren } from 'react';

/**
 * Custom render function that wraps components with necessary providers.
 * Extend this to add your own providers (e.g., i18n, theme, etc.)
 */
function AllTheProviders({ children }: PropsWithChildren) {
  return <>{children}</>;
}

/**
 * Custom render that includes all providers and sets up userEvent.
 *
 * @example
 * ```tsx
 * const { user } = renderWithProviders(<Button>Click me</Button>);
 * await user.click(screen.getByRole('button'));
 * ```
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
}

// Re-export screen and queries from @testing-library/dom
export { screen, waitFor, fireEvent, within } from '@testing-library/dom';
export { act } from 'react';

// Override render with our custom render
export { customRender as render };

/**
 * Helper to wait for async state updates
 */
export async function waitForStateUpdate() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}

/**
 * Create a mock image file
 */
export function createMockImageFile(
  name = 'test-image.png',
  size = 1024
): File {
  return createMockFile(name, size, 'image/png');
}

/**
 * Create a mock SVG file
 */
export function createMockSvgFile(
  name = 'test-image.svg',
  content = '<svg></svg>'
): File {
  return new File([content], name, { type: 'image/svg+xml' });
}

/**
 * Helper to simulate a paste event with clipboard data
 */
export function createPasteEvent(data: Record<string, string>) {
  const clipboardData = {
    getData: (type: string) => data[type] || '',
    types: Object.keys(data),
  };

  return new ClipboardEvent('paste', {
    clipboardData: clipboardData as unknown as DataTransfer,
  });
}

/**
 * Helper to simulate a drag and drop event
 */
export function createDragEvent(
  type: 'dragenter' | 'dragover' | 'dragleave' | 'drop',
  files: File[] = []
) {
  const dataTransfer = {
    files,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
    getData: () => '',
    setData: () => {},
  };

  return new DragEvent(type, {
    dataTransfer: dataTransfer as unknown as DataTransfer,
    bubbles: true,
    cancelable: true,
  });
}

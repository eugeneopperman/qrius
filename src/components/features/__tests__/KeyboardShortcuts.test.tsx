import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { KeyboardShortcutsModal } from '../KeyboardShortcuts';

// Mock the focus trap hook — no-op in tests
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

// Mock the shortcuts array with known values
vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  shortcuts: [
    { keys: ['Ctrl', '1-9'], description: 'Switch QR code type' },
    { keys: ['Ctrl', 'S'], description: 'Download QR code (PNG)' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Download with format picker' },
    { keys: ['Ctrl', 'C'], description: 'Copy QR code to clipboard' },
    { keys: ['Ctrl', 'D'], description: 'Cycle theme' },
    { keys: ['Ctrl', 'R'], description: 'Open QR code reader' },
    { keys: ['Ctrl', 'T'], description: 'Open templates' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ],
  useKeyboardShortcuts: vi.fn(),
}));

describe('KeyboardShortcutsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<KeyboardShortcutsModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with proper aria attributes', () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'keyboard-shortcuts-title');
  });

  it('renders "Keyboard Shortcuts" title', () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('renders keyboard shortcuts descriptions', () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);
    expect(screen.getByText('Switch QR code type')).toBeInTheDocument();
    expect(screen.getByText('Download QR code (PNG)')).toBeInTheDocument();
    expect(screen.getByText('Copy QR code to clipboard')).toBeInTheDocument();
    expect(screen.getByText('Cycle theme')).toBeInTheDocument();
    expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument();
  });

  it('renders kbd elements for shortcut keys', () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);
    // The "?" shortcut should render a kbd element
    const kbdElements = document.querySelectorAll('kbd');
    // 8 shortcuts with at least 1 kbd each, plus the footer "?" kbd
    expect(kbdElements.length).toBeGreaterThan(8);
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const { user } = render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} />);
    const closeButton = screen.getByLabelText('Close keyboard shortcuts');
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} />);
    // The backdrop is the first child with aria-hidden="true"
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows tip about "?" key in footer', () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);
    expect(screen.getByText(/anytime to show this dialog/)).toBeInTheDocument();
  });
});

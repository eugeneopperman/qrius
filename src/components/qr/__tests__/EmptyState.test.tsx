import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders "Create Your QR Code" title', () => {
    render(<EmptyState />);
    expect(screen.getByText('Create Your QR Code')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<EmptyState />);
    expect(
      screen.getByText('Enter your content on the left and watch your QR code appear here instantly')
    ).toBeInTheDocument();
  });

  it('renders keyboard shortcut hints with kbd elements', () => {
    render(<EmptyState />);
    expect(screen.getByText('1-9')).toBeInTheDocument();
    expect(screen.getByText('Switch types')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('has animate-fade-in animation class', () => {
    const { container } = render(<EmptyState />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('animate-fade-in');
  });

  it('renders kbd elements styled as keyboard keys', () => {
    render(<EmptyState />);
    const kbdElements = document.querySelectorAll('kbd');
    expect(kbdElements).toHaveLength(2);
    // Verify they contain the shortcut keys
    expect(kbdElements[0].textContent).toBe('1-9');
    expect(kbdElements[1].textContent).toBe('S');
  });
});

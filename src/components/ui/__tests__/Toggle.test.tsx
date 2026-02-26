import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Toggle, InlineToggle } from '../Toggle';

describe('Toggle', () => {
  describe('rendering', () => {
    it('renders a switch element', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Toggle checked={false} onChange={() => {}} label="Enable feature" />);
      expect(screen.getByText('Enable feature')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<Toggle checked={false} onChange={() => {}} label="Feature" description="Toggle this feature" />);
      expect(screen.getByText('Toggle this feature')).toBeInTheDocument();
    });

    it('reflects checked state via aria-checked', () => {
      render(<Toggle checked={true} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('reflects unchecked state via aria-checked', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('interactions', () => {
    it('calls onChange with toggled value when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={false} onChange={handleChange} />);
      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when checked toggle is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={true} onChange={handleChange} />);
      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={false} onChange={handleChange} disabled />);
      await user.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Toggle checked={false} onChange={() => {}} size="sm" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-5', 'w-9');
    });

    it('renders default (md) size', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-6', 'w-11');
    });
  });

  describe('disabled state', () => {
    it('applies opacity when disabled', () => {
      render(<Toggle checked={false} onChange={() => {}} disabled />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('opacity-50');
    });

    it('applies disabled styling to label', () => {
      render(<Toggle checked={false} onChange={() => {}} disabled label="Feature" />);
      const label = screen.getByText('Feature');
      expect(label).toHaveClass('text-gray-400');
    });
  });
});

describe('InlineToggle', () => {
  it('renders with label', () => {
    render(<InlineToggle checked={false} onChange={() => {}} label="Feature" />);
    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('calls onChange on click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<InlineToggle checked={false} onChange={handleChange} label="Feature" />);
    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});

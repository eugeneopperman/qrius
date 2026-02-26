import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  describe('rendering', () => {
    it('renders a textarea element', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Textarea label="Description" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('has default rows of 3', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
    });

    it('accepts custom rows', () => {
      render(<Textarea rows={5} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });
  });

  describe('interactions', () => {
    it('allows typing', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      expect(textarea).toHaveValue('Hello world');
    });

    it('calls onChange when typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);
      await user.type(screen.getByRole('textbox'), 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('respects disabled state', () => {
      render(<Textarea disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      render(<Textarea error="Required field" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Textarea error="Invalid" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('adds error styling', () => {
      render(<Textarea error="Error" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-red-500/50');
    });
  });

  describe('hint text', () => {
    it('displays hint text', () => {
      render(<Textarea hint="Enter description" />);
      expect(screen.getByText('Enter description')).toBeInTheDocument();
    });

    it('hides hint when error is present', () => {
      render(<Textarea hint="Hint" error="Error" />);
      expect(screen.queryByText('Hint')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('supports placeholder', () => {
      render(<Textarea placeholder="Type here..." />);
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('generates id when not provided', () => {
      render(<Textarea label="Notes" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id');
      expect(textarea.id).not.toBe('');
    });
  });

  describe('forwarded ref', () => {
    it('forwards ref to textarea element', () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});

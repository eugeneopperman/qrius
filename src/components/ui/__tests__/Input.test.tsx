import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email" />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders required indicator when required', () => {
      render(<Input label="Email" required />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not render required indicator when not required', () => {
      render(<Input label="Email" />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      render(<Input error="This field is required" />);

      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input error="Invalid input" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error with input via aria-describedby', () => {
      render(<Input id="email" error="Invalid email" />);

      const input = screen.getByRole('textbox');
      const error = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(error.id));
    });

    it('adds error styling to input', () => {
      render(<Input error="Error" />);

      expect(screen.getByRole('textbox')).toHaveClass('border-red-500/50');
    });
  });

  describe('hint text', () => {
    it('displays hint text', () => {
      render(<Input hint="Enter your email address" />);

      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('hides hint when error is present', () => {
      render(<Input hint="Enter your email" error="Invalid email" />);

      expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('associates hint with input via aria-describedby', () => {
      render(<Input id="email" hint="Example: user@email.com" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('interactions', () => {
    it('allows typing', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');

      expect(input).toHaveValue('Hello');
    });

    it('calls onChange when typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole('textbox'), 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('respects disabled state', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();

      await user.type(input, 'test');
      expect(input).toHaveValue('');
    });
  });

  describe('accessibility', () => {
    it('uses provided id', () => {
      render(<Input id="custom-id" label="Custom" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
    });

    it('generates id when not provided', () => {
      render(<Input label="Auto ID" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
      expect(input.id).not.toBe('');
    });

    it('label is associated with input', () => {
      render(<Input label="Username" />);

      // getByLabelText will throw if association is broken
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('supports placeholder', () => {
      render(<Input placeholder="Enter text..." />);

      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });
  });

  describe('types', () => {
    it('supports email type', () => {
      render(<Input type="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<Input type="password" />);

      // Password inputs don't have textbox role
      expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    it('supports number type', () => {
      render(<Input type="number" />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" />);

      expect(screen.getByRole('textbox')).toHaveClass('input', 'custom-class');
    });
  });

  describe('forwarded ref', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });
});

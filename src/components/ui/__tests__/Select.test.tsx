import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

const mockOptions = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('Select', () => {
  describe('rendering', () => {
    it('renders a select element', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Gamma' })).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Select options={mockOptions} label="Choose" />);
      expect(screen.getByLabelText('Choose')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Select options={mockOptions} label="Choose" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('value selection', () => {
    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select options={mockOptions} onChange={handleChange} />);
      await user.selectOptions(screen.getByRole('combobox'), 'b');
      expect(handleChange).toHaveBeenCalled();
    });

    it('reflects selected value', () => {
      render(<Select options={mockOptions} value="b" onChange={() => {}} />);
      expect(screen.getByRole('combobox')).toHaveValue('b');
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      render(<Select options={mockOptions} error="Required field" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Select options={mockOptions} error="Invalid" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('hint text', () => {
    it('displays hint text', () => {
      render(<Select options={mockOptions} hint="Select an option" />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('hides hint when error is present', () => {
      render(<Select options={mockOptions} hint="Hint" error="Error" />);
      expect(screen.queryByText('Hint')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables the select element', () => {
      render(<Select options={mockOptions} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('uses provided id', () => {
      render(<Select options={mockOptions} id="my-select" label="Choose" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-select');
    });

    it('associates error with select via aria-describedby', () => {
      render(<Select options={mockOptions} id="sel" error="Error msg" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
    });
  });

  describe('forwarded ref', () => {
    it('forwards ref to select element', () => {
      const ref = vi.fn();
      render(<Select options={mockOptions} ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLSelectElement);
    });
  });
});

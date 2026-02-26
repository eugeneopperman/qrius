import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { Slider } from '../Slider';

describe('Slider', () => {
  describe('rendering', () => {
    it('renders a range input', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Slider label="Volume" />);
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('shows value by default when label is present', () => {
      render(<Slider label="Volume" value={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('shows value with unit', () => {
      render(<Slider label="Volume" value={75} unit="%" />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hides value when showValue is false', () => {
      render(<Slider label="Volume" value={50} showValue={false} />);
      expect(screen.queryByText('50')).not.toBeInTheDocument();
    });
  });

  describe('min/max/step', () => {
    it('sets min attribute', () => {
      render(<Slider min={10} />);
      expect(screen.getByRole('slider')).toHaveAttribute('min', '10');
    });

    it('sets max attribute', () => {
      render(<Slider max={200} />);
      expect(screen.getByRole('slider')).toHaveAttribute('max', '200');
    });

    it('sets step attribute', () => {
      render(<Slider step={5} />);
      expect(screen.getByRole('slider')).toHaveAttribute('step', '5');
    });

    it('defaults to min=0, max=100, step=1', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '1');
    });
  });

  describe('interactions', () => {
    it('calls onChange with numeric value', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} />);
      fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } });
      expect(handleChange).toHaveBeenCalledWith(75);
    });
  });

  describe('tick labels', () => {
    it('renders tick labels when showTicks and tickLabels provided', () => {
      render(<Slider showTicks tickLabels={['Low', 'Med', 'High']} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Med')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('forwarded ref', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Slider ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });
});

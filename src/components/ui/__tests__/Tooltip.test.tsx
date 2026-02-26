import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { Tooltip, LabelWithTooltip } from '../Tooltip';

describe('Tooltip', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('renders default trigger when no children', () => {
      render(<Tooltip content="Help text" />);
      expect(screen.getByLabelText('More information')).toBeInTheDocument();
    });

    it('does not show tooltip initially', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('hover behavior', () => {
    it('shows tooltip on mouse enter', async () => {
      render(
        <Tooltip content="Help text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );
      // onMouseEnter is on the wrapper div, not the child button
      const wrapper = screen.getByRole('button', { name: 'Hover me' }).parentElement!;
      fireEvent.mouseOver(wrapper);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Help text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );
      const wrapper = screen.getByRole('button', { name: 'Hover me' }).parentElement!;
      fireEvent.mouseOver(wrapper);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      fireEvent.mouseOut(wrapper);
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('focus behavior', () => {
    it('shows tooltip on focus', async () => {
      render(
        <Tooltip content="Help text" delay={0}>
          <button>Focus me</button>
        </Tooltip>
      );
      // React onFocus is implemented via focusin which bubbles from child to wrapper
      const wrapper = screen.getByRole('button', { name: 'Focus me' }).parentElement!;
      fireEvent.focusIn(wrapper);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      render(
        <Tooltip content="Help text" delay={0}>
          <button>Focus me</button>
        </Tooltip>
      );
      const wrapper = screen.getByRole('button', { name: 'Focus me' }).parentElement!;
      fireEvent.focusIn(wrapper);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      fireEvent.focusOut(wrapper);
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('content', () => {
    it('renders string content', async () => {
      render(
        <Tooltip content="Simple text" delay={0}>
          <button>Trigger</button>
        </Tooltip>
      );
      const wrapper = screen.getByRole('button').parentElement!;
      fireEvent.mouseOver(wrapper);
      await waitFor(() => {
        expect(screen.getByText('Simple text')).toBeInTheDocument();
      });
    });

    it('renders JSX content', async () => {
      render(
        <Tooltip content={<span data-testid="custom">Custom</span>} delay={0}>
          <button>Trigger</button>
        </Tooltip>
      );
      const wrapper = screen.getByRole('button').parentElement!;
      fireEvent.mouseOver(wrapper);
      await waitFor(() => {
        expect(screen.getByTestId('custom')).toBeInTheDocument();
      });
    });
  });
});

describe('LabelWithTooltip', () => {
  it('renders label text', () => {
    render(<LabelWithTooltip label="Field Name" tooltip="Help" />);
    expect(screen.getByText('Field Name')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(<LabelWithTooltip label="Field" tooltip="Help" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not render required indicator when not required', () => {
    render(<LabelWithTooltip label="Field" tooltip="Help" />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});

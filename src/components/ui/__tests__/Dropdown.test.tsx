import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../Dropdown';

function renderDropdown(props = {}) {
  return render(
    <Dropdown
      trigger={({ isOpen, toggle }) => (
        <button onClick={toggle} data-testid="trigger">
          {isOpen ? 'Close' : 'Open'}
        </button>
      )}
      {...props}
    >
      {({ close }) => (
        <div>
          <button onClick={close}>Item 1</button>
          <button onClick={close}>Item 2</button>
        </div>
      )}
    </Dropdown>
  );
}

describe('Dropdown', () => {
  describe('rendering', () => {
    it('renders trigger', () => {
      renderDropdown();
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('does not show menu initially', () => {
      renderDropdown();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('has aria-haspopup attribute', () => {
      renderDropdown();
      const container = screen.getByTestId('trigger').closest('[aria-haspopup]');
      expect(container).toHaveAttribute('aria-haspopup', 'true');
    });

    it('has aria-expanded false initially', () => {
      renderDropdown();
      const container = screen.getByTestId('trigger').closest('[aria-expanded]');
      expect(container).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('open/close', () => {
    it('opens menu on trigger click', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows menu items when open', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Item 2' })).toBeInTheDocument();
    });

    it('closes menu on trigger click when open', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      await user.click(screen.getByTestId('trigger'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes when child calls close()', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      await user.click(screen.getByRole('button', { name: 'Item 1' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('updates aria-expanded when open', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      const container = screen.getByTestId('trigger').closest('[aria-expanded]');
      expect(container).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('trigger state', () => {
    it('passes isOpen=false to trigger when closed', () => {
      renderDropdown();
      expect(screen.getByTestId('trigger')).toHaveTextContent('Open');
    });

    it('passes isOpen=true to trigger when open', async () => {
      const user = userEvent.setup();
      renderDropdown();
      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('trigger')).toHaveTextContent('Close');
    });
  });
});

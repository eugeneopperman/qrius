import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '../Tabs';

function renderTabs({ onChange }: { onChange?: (index: number) => void } = {}) {
  return render(
    <TabGroup onChange={onChange}>
      <TabList>
        <Tab>Alpha</Tab>
        <Tab>Beta</Tab>
        <Tab>Gamma</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Panel Alpha</TabPanel>
        <TabPanel>Panel Beta</TabPanel>
        <TabPanel>Panel Gamma</TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

describe('Tabs', () => {
  describe('rendering', () => {
    it('renders all tabs', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Beta' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Gamma' })).toBeInTheDocument();
    });

    it('renders tablist', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders first panel by default', () => {
      renderTabs();
      expect(screen.getByText('Panel Alpha')).toBeInTheDocument();
    });

    it('hides non-active panels', () => {
      renderTabs();
      expect(screen.queryByText('Panel Beta')).not.toBeInTheDocument();
      expect(screen.queryByText('Panel Gamma')).not.toBeInTheDocument();
    });
  });

  describe('tab selection', () => {
    it('first tab is selected by default', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false');
    });

    it('selects tab on click', async () => {
      const { user } = renderTabs();
      await user.click(screen.getByRole('tab', { name: 'Beta' }));

      expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false');
    });

    it('shows corresponding panel when tab is clicked', async () => {
      const { user } = renderTabs();
      await user.click(screen.getByRole('tab', { name: 'Gamma' }));

      expect(screen.getByText('Panel Gamma')).toBeInTheDocument();
      expect(screen.queryByText('Panel Alpha')).not.toBeInTheDocument();
    });

    it('fires onChange callback', async () => {
      const onChange = vi.fn();
      const { user } = renderTabs({ onChange });

      await user.click(screen.getByRole('tab', { name: 'Beta' }));
      expect(onChange).toHaveBeenCalledWith(1);

      await user.click(screen.getByRole('tab', { name: 'Gamma' }));
      expect(onChange).toHaveBeenCalledWith(2);
    });
  });

  describe('keyboard navigation', () => {
    it('moves to next tab with ArrowRight', () => {
      renderTabs();
      const firstTab = screen.getByRole('tab', { name: 'Alpha' });
      firstTab.focus();

      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    });

    it('moves to previous tab with ArrowLeft', async () => {
      const { user } = renderTabs();
      // First go to Beta
      await user.click(screen.getByRole('tab', { name: 'Beta' }));

      const betaTab = screen.getByRole('tab', { name: 'Beta' });
      fireEvent.keyDown(betaTab, { key: 'ArrowLeft' });
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around from last to first with ArrowRight', async () => {
      const { user } = renderTabs();
      await user.click(screen.getByRole('tab', { name: 'Gamma' }));

      const gammaTab = screen.getByRole('tab', { name: 'Gamma' });
      fireEvent.keyDown(gammaTab, { key: 'ArrowRight' });
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around from first to last with ArrowLeft', () => {
      renderTabs();
      const firstTab = screen.getByRole('tab', { name: 'Alpha' });
      firstTab.focus();

      fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });
      expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    });

    it('goes to first tab with Home key', async () => {
      const { user } = renderTabs();
      await user.click(screen.getByRole('tab', { name: 'Gamma' }));

      const gammaTab = screen.getByRole('tab', { name: 'Gamma' });
      fireEvent.keyDown(gammaTab, { key: 'Home' });
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    });

    it('goes to last tab with End key', () => {
      renderTabs();
      const firstTab = screen.getByRole('tab', { name: 'Alpha' });
      firstTab.focus();

      fireEvent.keyDown(firstTab, { key: 'End' });
      expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('accessibility', () => {
    it('tabs have correct role attributes', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab, i) => {
        expect(tab).toHaveAttribute('id', `tab-${i}`);
        expect(tab).toHaveAttribute('aria-controls', `tabpanel-${i}`);
      });
    });

    it('active tab has tabIndex 0, others have -1', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('tabindex', '-1');
    });

    it('panels have correct ARIA attributes', () => {
      renderTabs();
      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveAttribute('id', 'tabpanel-0');
      expect(panel).toHaveAttribute('aria-labelledby', 'tab-0');
    });
  });

  describe('defaultTab', () => {
    it('starts on specified tab', () => {
      render(
        <TabGroup defaultTab={1}>
          <TabList>
            <Tab>A</Tab>
            <Tab>B</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>Panel A</TabPanel>
            <TabPanel>Panel B</TabPanel>
          </TabPanels>
        </TabGroup>
      );
      expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Panel B')).toBeInTheDocument();
    });
  });
});

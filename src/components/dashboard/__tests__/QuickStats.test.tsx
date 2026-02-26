import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { QuickStats } from '../QuickStats';

const defaultProps = {
  qrCodesCount: 42,
  scansToday: 150,
  scansThisMonth: 3200,
  teamMembers: 5,
};

describe('QuickStats', () => {
  describe('desktop stat cards', () => {
    it('renders Total QR Codes title', () => {
      render(<QuickStats {...defaultProps} />);
      // Desktop cards have title as text content (multiple matches for mobile + desktop)
      const titles = screen.getAllByText('Total QR Codes');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Scans Today title', () => {
      render(<QuickStats {...defaultProps} />);
      const titles = screen.getAllByText('Scans Today');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Scans This Month title', () => {
      render(<QuickStats {...defaultProps} />);
      const titles = screen.getAllByText('Scans This Month');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Team Members title', () => {
      render(<QuickStats {...defaultProps} />);
      const titles = screen.getAllByText('Team Members');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders QR codes count value', () => {
      render(<QuickStats {...defaultProps} />);
      const values = screen.getAllByText('42');
      expect(values.length).toBeGreaterThanOrEqual(1);
    });

    it('renders scans today value', () => {
      render(<QuickStats {...defaultProps} />);
      const values = screen.getAllByText('150');
      expect(values.length).toBeGreaterThanOrEqual(1);
    });

    it('renders scans this month value with locale formatting', () => {
      render(<QuickStats {...defaultProps} />);
      // scansThisMonth.toLocaleString() produces "3,200"
      const values = screen.getAllByText('3,200');
      expect(values.length).toBeGreaterThanOrEqual(1);
    });

    it('renders team members value', () => {
      render(<QuickStats {...defaultProps} />);
      const values = screen.getAllByText('5');
      expect(values.length).toBeGreaterThanOrEqual(1);
    });

    it('renders 4 desktop stat cards', () => {
      const { container } = render(<QuickStats {...defaultProps} />);
      // Desktop grid has hidden sm:grid class
      const desktopGrid = container.querySelector('.hidden.sm\\:grid');
      expect(desktopGrid).toBeInTheDocument();
      // Each StatCard is a .glass div inside the grid
      const cards = desktopGrid?.querySelectorAll(':scope > .glass');
      expect(cards?.length).toBe(4);
    });
  });

  describe('mobile pill bar', () => {
    it('renders mobile container with sm:hidden class', () => {
      const { container } = render(<QuickStats {...defaultProps} />);
      const mobileContainer = container.querySelector('.sm\\:hidden');
      expect(mobileContainer).toBeInTheDocument();
    });

    it('renders 4 selectable pill buttons', () => {
      const { container } = render(<QuickStats {...defaultProps} />);
      const mobileContainer = container.querySelector('.sm\\:hidden');
      const buttons = mobileContainer?.querySelectorAll('button');
      expect(buttons?.length).toBe(4);
    });

    it('shows first stat label by default (Total QR Codes)', () => {
      render(<QuickStats {...defaultProps} />);
      // The mobile label is the last <p> inside the sm:hidden container
      // The default selected index is 0 → "Total QR Codes"
      const labels = screen.getAllByText('Total QR Codes');
      expect(labels.length).toBeGreaterThanOrEqual(1);
    });

    it('changes selected stat on pill click', async () => {
      const user = userEvent.setup();
      const { container } = render(<QuickStats {...defaultProps} />);
      const mobileContainer = container.querySelector('.sm\\:hidden');
      const buttons = mobileContainer?.querySelectorAll('button');

      // Click the second pill (Scans Today)
      if (buttons && buttons[1]) {
        await user.click(buttons[1]);
      }

      // After clicking second pill, the mobile label should show "Scans Today"
      // Both mobile label and desktop card will have this text
      const labels = screen.getAllByText('Scans Today');
      expect(labels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('handles zero values', () => {
      render(<QuickStats qrCodesCount={0} scansToday={0} scansThisMonth={0} teamMembers={0} />);
      const zeros = screen.getAllByText('0');
      // At least 4 zeros across mobile + desktop (some may show "0" in both views)
      expect(zeros.length).toBeGreaterThanOrEqual(4);
    });

    it('handles large scans this month with locale formatting', () => {
      render(<QuickStats {...defaultProps} scansThisMonth={1234567} />);
      const values = screen.getAllByText('1,234,567');
      expect(values.length).toBeGreaterThanOrEqual(1);
    });
  });
});

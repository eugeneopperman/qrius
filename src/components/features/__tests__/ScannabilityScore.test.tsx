import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ScannabilityScore } from '../ScannabilityScore';
import type { ScannabilityResult } from '@/utils/scannabilityAnalyzer';

// Mock qrStore
const mockGetQRValue = vi.fn().mockReturnValue('https://example.com');
const mockStyleOptions = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  logoSize: 0.2,
  logoUrl: '',
  errorCorrectionLevel: 'M' as const,
};

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      styleOptions: mockStyleOptions,
      getQRValue: mockGetQRValue,
    }),
}));

// Mock useDebounce to return value immediately
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

// Mock analyzeScannability
const mockAnalysis: ScannabilityResult = {
  score: 'excellent',
  percentage: 95,
  issues: [],
  suggestions: [],
};

vi.mock('@/utils/scannabilityAnalyzer', () => ({
  analyzeScannability: () => mockAnalysis,
}));

describe('ScannabilityScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalysis.score = 'excellent';
    mockAnalysis.percentage = 95;
    mockAnalysis.issues = [];
    mockAnalysis.suggestions = [];
  });

  describe('score display', () => {
    it('renders excellent score', () => {
      render(<ScannabilityScore />);
      expect(screen.getByText(/Scannability: Excellent/)).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    it('renders good score', () => {
      mockAnalysis.score = 'good';
      mockAnalysis.percentage = 80;
      render(<ScannabilityScore />);
      expect(screen.getByText(/Scannability: Good/)).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('renders warning score', () => {
      mockAnalysis.score = 'warning';
      mockAnalysis.percentage = 55;
      render(<ScannabilityScore />);
      expect(screen.getByText(/Scannability: Warning/)).toBeInTheDocument();
      expect(screen.getByText('55%')).toBeInTheDocument();
    });

    it('renders poor score', () => {
      mockAnalysis.score = 'poor';
      mockAnalysis.percentage = 20;
      render(<ScannabilityScore />);
      expect(screen.getByText(/Scannability: Poor/)).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders progress bar with correct width', () => {
      mockAnalysis.percentage = 75;
      const { container } = render(<ScannabilityScore />);
      const bar = container.querySelector('[style*="width: 75%"]');
      expect(bar).toBeInTheDocument();
    });
  });

  describe('issues', () => {
    it('renders issues when present', () => {
      mockAnalysis.issues = [
        { type: 'contrast', severity: 'high', message: 'Low contrast ratio' },
        { type: 'logo', severity: 'medium', message: 'Logo may be too large' },
      ];
      render(<ScannabilityScore />);
      expect(screen.getByText('Low contrast ratio')).toBeInTheDocument();
      expect(screen.getByText('Logo may be too large')).toBeInTheDocument();
    });

    it('does not render issues section when empty', () => {
      mockAnalysis.issues = [];
      const { container } = render(<ScannabilityScore />);
      // The "all good" message should show instead
      expect(screen.getByText(/scan reliably/)).toBeInTheDocument();
      // No issue items
      expect(container.querySelectorAll('[class*="text-red"]')).toHaveLength(0);
    });
  });

  describe('suggestions', () => {
    it('renders suggestions when present', () => {
      mockAnalysis.suggestions = ['Increase contrast', 'Reduce logo size'];
      render(<ScannabilityScore />);
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Increase contrast')).toBeInTheDocument();
      expect(screen.getByText('Reduce logo size')).toBeInTheDocument();
    });

    it('limits to 3 suggestions', () => {
      mockAnalysis.suggestions = ['Tip 1', 'Tip 2', 'Tip 3', 'Tip 4'];
      render(<ScannabilityScore />);
      expect(screen.getByText('Tip 1')).toBeInTheDocument();
      expect(screen.getByText('Tip 3')).toBeInTheDocument();
      expect(screen.queryByText('Tip 4')).not.toBeInTheDocument();
    });

    it('does not render suggestions section when empty', () => {
      mockAnalysis.suggestions = [];
      render(<ScannabilityScore />);
      expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
    });
  });

  describe('all good state', () => {
    it('shows positive message when no issues', () => {
      mockAnalysis.issues = [];
      render(<ScannabilityScore />);
      expect(screen.getByText(/scan reliably across all devices/)).toBeInTheDocument();
    });

    it('hides positive message when issues exist', () => {
      mockAnalysis.issues = [{ type: 'contrast', severity: 'low', message: 'Minor issue' }];
      render(<ScannabilityScore />);
      expect(screen.queryByText(/scan reliably/)).not.toBeInTheDocument();
    });
  });
});

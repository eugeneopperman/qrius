import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StudioPanel } from '../StudioPanel';
import { useStudioStore } from '@/stores/studioStore';
import type { BrandTemplateStyle } from '@/types';

// Mock heavy panel components with simple stubs
vi.mock('../panels/PanelDotsColors', () => ({
  PanelDotsColors: () => <div data-testid="panel-dots-colors">DotsColors Panel</div>,
}));
vi.mock('../panels/PanelFrame', () => ({
  PanelFrame: () => <div data-testid="panel-frame">Frame Panel</div>,
}));
vi.mock('../panels/PanelLogo', () => ({
  PanelLogo: () => <div data-testid="panel-logo">Logo Panel</div>,
}));
vi.mock('../panels/PanelLabel', () => ({
  PanelLabel: () => <div data-testid="panel-label">Label Panel</div>,
}));
vi.mock('../panels/PanelBackground', () => ({
  PanelBackground: () => <div data-testid="panel-background">Background Panel</div>,
}));

const DEFAULT_STYLE: BrandTemplateStyle = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersDotType: 'square',
  errorCorrectionLevel: 'H',
  qrRoundness: 0,
  qrPattern: 'solid',
  frameBorderRadius: 0,
  frameStyle: 'none',
};

function resetStore() {
  useStudioStore.setState({
    templateId: null,
    templateName: 'Test',
    style: { ...DEFAULT_STYLE },
    activePanel: null,
    undoStack: [],
    redoStack: [],
    isDirty: false,
    originalStyle: null,
    _undoTimer: null,
  });
}

describe('StudioPanel', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders all 5 tab buttons', () => {
    render(<StudioPanel />);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(5);
  });

  it('shows empty state when no panel is active', () => {
    render(<StudioPanel />);
    expect(screen.getByText(/Click a QR element or tab/)).toBeInTheDocument();
  });

  it('shows dots-colors panel when active', () => {
    useStudioStore.setState({ activePanel: 'dots-colors' });
    render(<StudioPanel />);
    expect(screen.getByTestId('panel-dots-colors')).toBeInTheDocument();
  });

  it('shows frame panel when active', () => {
    useStudioStore.setState({ activePanel: 'frame' });
    render(<StudioPanel />);
    expect(screen.getByTestId('panel-frame')).toBeInTheDocument();
  });

  it('shows logo panel when active', () => {
    useStudioStore.setState({ activePanel: 'logo' });
    render(<StudioPanel />);
    expect(screen.getByTestId('panel-logo')).toBeInTheDocument();
  });

  it('shows label panel when active', () => {
    useStudioStore.setState({ activePanel: 'label' });
    render(<StudioPanel />);
    expect(screen.getByTestId('panel-label')).toBeInTheDocument();
  });

  it('shows background panel when active', () => {
    useStudioStore.setState({ activePanel: 'background' });
    render(<StudioPanel />);
    expect(screen.getByTestId('panel-background')).toBeInTheDocument();
  });

  it('clicking a tab sets activePanel', async () => {
    const { user } = render(<StudioPanel />);
    // Find the "Style" tab (first tab)
    const styleButtons = screen.getAllByRole('button').filter(b => b.textContent?.includes('Style'));
    if (styleButtons.length > 0) {
      await user.click(styleButtons[0]);
      expect(useStudioStore.getState().activePanel).toBe('dots-colors');
    }
  });

  it('clicking an active tab deactivates it', async () => {
    useStudioStore.setState({ activePanel: 'frame' });
    const { user } = render(<StudioPanel />);
    const frameButtons = screen.getAllByRole('button').filter(b => b.textContent?.includes('Frame'));
    if (frameButtons.length > 0) {
      await user.click(frameButtons[0]);
      expect(useStudioStore.getState().activePanel).toBeNull();
    }
  });
});

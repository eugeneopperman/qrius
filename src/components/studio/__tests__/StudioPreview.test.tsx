import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StudioPreview } from '../StudioPreview';
import { useStudioStore } from '@/stores/studioStore';
import type { BrandTemplateStyle } from '@/types';

// Mock QR code instance (heavy canvas)
vi.mock('@/hooks/useQRCodeInstance', () => ({
  useQRCodeInstance: () => ({
    containerRef: { current: null },
    qrCodeRef: { current: null },
    processedLogoUrl: undefined,
  }),
}));

// Mock Google Font hook
vi.mock('@/hooks/useGoogleFont', () => ({
  useGoogleFont: vi.fn(),
  getFontFamily: (name?: string) => name || 'system-ui',
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

function resetStore(styleOverrides: Partial<BrandTemplateStyle> = {}) {
  useStudioStore.setState({
    templateId: null,
    templateName: 'Test',
    style: { ...DEFAULT_STYLE, ...styleOverrides },
    activePanel: null,
    undoStack: [],
    redoStack: [],
    isDirty: false,
    originalStyle: null,
    hasInteracted: false,
    popover: null,
    _undoTimer: null,
  });
}

describe('StudioPreview', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders background hit zone', () => {
    render(<StudioPreview />);
    expect(screen.getByLabelText('Edit background')).toBeInTheDocument();
  });

  it('renders QR body hit zone', () => {
    render(<StudioPreview />);
    expect(screen.getByLabelText('Edit QR style and colors')).toBeInTheDocument();
  });

  it('does not render logo hit zone when no logo', () => {
    render(<StudioPreview />);
    expect(screen.queryByLabelText('Edit logo')).not.toBeInTheDocument();
  });

  it('renders logo hit zone when logo is present', () => {
    resetStore({ logoUrl: 'data:image/png;base64,abc' });
    render(<StudioPreview />);
    expect(screen.getByLabelText('Edit logo')).toBeInTheDocument();
  });

  it('does not render frame hit zone when frame is none', () => {
    render(<StudioPreview />);
    expect(screen.queryByLabelText('Edit frame')).not.toBeInTheDocument();
  });

  it('renders frame hit zone when frame is set', () => {
    resetStore({ frameStyle: 'simple' });
    render(<StudioPreview />);
    expect(screen.getByLabelText('Edit frame')).toBeInTheDocument();
  });

  it('clicking background sets activePanel to background', async () => {
    const { user } = render(<StudioPreview />);
    await user.click(screen.getByLabelText('Edit background'));
    expect(useStudioStore.getState().activePanel).toBe('background');
  });

  it('clicking QR body sets activePanel to dots-colors', async () => {
    const { user } = render(<StudioPreview />);
    await user.click(screen.getByLabelText('Edit QR style and colors'));
    expect(useStudioStore.getState().activePanel).toBe('dots-colors');
  });

  it('clicking logo sets activePanel to logo', async () => {
    resetStore({ logoUrl: 'data:image/png;base64,abc' });
    const { user } = render(<StudioPreview />);
    await user.click(screen.getByLabelText('Edit logo'));
    expect(useStudioStore.getState().activePanel).toBe('logo');
  });

  it('clicking frame sets activePanel to frame', async () => {
    resetStore({ frameStyle: 'rounded' });
    const { user } = render(<StudioPreview />);
    await user.click(screen.getByLabelText('Edit frame'));
    expect(useStudioStore.getState().activePanel).toBe('frame');
  });

  it('renders bottom label when frame is bottom-label with text', () => {
    resetStore({ frameStyle: 'bottom-label', frameLabel: 'Scan Me' });
    render(<StudioPreview />);
    expect(screen.getByText('Scan Me')).toBeInTheDocument();
  });

  it('renders label hit zone for bottom-label frame', () => {
    resetStore({ frameStyle: 'bottom-label', frameLabel: 'Scan Me' });
    render(<StudioPreview />);
    expect(screen.getByLabelText('Edit label')).toBeInTheDocument();
  });

  it('shows hover tooltips on hit zones', () => {
    render(<StudioPreview />);
    // Tooltips are present as span text (hidden via opacity)
    expect(screen.getByText('Click to edit style')).toBeInTheDocument();
    expect(screen.getByText('Click to edit background')).toBeInTheDocument();
  });

  it('shows pulse animation on QR body when not interacted', () => {
    render(<StudioPreview />);
    const qrBody = screen.getByLabelText('Edit QR style and colors');
    expect(qrBody.className).toContain('animate-pulse');
  });

  it('removes pulse animation after interaction', () => {
    useStudioStore.setState({ hasInteracted: true });
    render(<StudioPreview />);
    const qrBody = screen.getByLabelText('Edit QR style and colors');
    expect(qrBody.className).not.toContain('animate-pulse');
  });

  it('sets popover state on click', async () => {
    const { user } = render(<StudioPreview />);
    await user.click(screen.getByLabelText('Edit QR style and colors'));
    const popover = useStudioStore.getState().popover;
    expect(popover).not.toBeNull();
    expect(popover?.panel).toBe('dots-colors');
  });
});

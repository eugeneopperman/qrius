import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StudioHeader } from '../StudioHeader';
import { useStudioStore } from '@/stores/studioStore';
import type { BrandTemplateStyle } from '@/types';

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
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
    templateName: 'My Template',
    style: { ...DEFAULT_STYLE },
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

describe('StudioHeader', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders template name', () => {
    render(<StudioHeader />);
    expect(screen.getByText('My Template')).toBeInTheDocument();
  });

  it('renders back link to templates', () => {
    render(<StudioHeader />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/templates');
  });

  it('renders save button', () => {
    render(<StudioHeader />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders undo button', () => {
    render(<StudioHeader />);
    expect(screen.getByTitle('Undo (Cmd+Z)')).toBeInTheDocument();
  });

  it('renders redo button', () => {
    render(<StudioHeader />);
    expect(screen.getByTitle('Redo (Cmd+Shift+Z)')).toBeInTheDocument();
  });

  it('shows dirty indicator when isDirty', () => {
    useStudioStore.setState({ isDirty: true });
    render(<StudioHeader />);
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
  });

  it('does not show dirty indicator when clean', () => {
    render(<StudioHeader />);
    expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
  });

  it('disables undo when stack is empty', () => {
    render(<StudioHeader />);
    const undoBtn = screen.getByTitle('Undo (Cmd+Z)');
    expect(undoBtn).toBeDisabled();
  });

  it('enables undo when stack has items', () => {
    useStudioStore.setState({ undoStack: [{ ...DEFAULT_STYLE }] });
    render(<StudioHeader />);
    const undoBtn = screen.getByTitle('Undo (Cmd+Z)');
    expect(undoBtn).not.toBeDisabled();
  });

  it('clicking name enters edit mode', async () => {
    const { user } = render(<StudioHeader />);
    await user.click(screen.getByText('My Template'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

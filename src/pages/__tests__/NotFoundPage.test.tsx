import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import NotFoundPage from '../NotFoundPage';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('NotFoundPage', () => {
  it('renders 404 text', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders "Page not found" heading', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByText(/the page you're looking for doesn't exist or has been moved/i)
    ).toBeInTheDocument();
  });

  it('renders Go Back button', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('renders Home link pointing to /', () => {
    render(<NotFoundPage />);
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('calls window.history.back() when Go Back is clicked', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { user } = render(<NotFoundPage />);

    await user.click(screen.getByRole('button', { name: /go back/i }));

    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });
});

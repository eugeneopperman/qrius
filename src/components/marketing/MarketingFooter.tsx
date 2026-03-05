import { Link } from '@tanstack/react-router';
import { MARKETING_VERSION } from '@/config/constants';

interface FooterLink {
  label: string;
  href: string;
  internal?: boolean;
  badge?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features', internal: true },
      { label: 'Pricing', href: '/pricing', internal: true },
      { label: 'Changelog', href: '/changelog', internal: true },
      { label: 'API', href: '#', badge: 'Soon' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { label: 'Restaurants', href: '/use-cases/restaurants', internal: true },
      { label: 'Retail', href: '/use-cases/retail', internal: true },
      { label: 'Events', href: '/use-cases/events', internal: true },
      { label: 'Agencies', href: '/use-cases/agencies', internal: true },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'vs Bitly', href: '/compare/bitly', internal: true },
      { label: 'vs QR Code Generator', href: '/compare/qr-code-generator', internal: true },
      { label: 'vs Uniqode', href: '/compare/uniqode', internal: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about', internal: true },
      { label: 'Blog', href: '/blog', internal: true },
      { label: 'Contact', href: '/contact', internal: true },
      { label: 'Help Center', href: 'https://support.qriuscodes.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '/terms', internal: true },
      { label: 'Privacy', href: '/privacy', internal: true },
      { label: 'Cookies', href: '/cookies', internal: true },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: '#ffffff' }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8" style={{ maxWidth: 1200 }}>
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <p
                className="text-sm font-semibold uppercase mb-4"
                style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)' }}
              >
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link
                        to={link.href as string}
                        className="marketing-footer-link inline-flex items-center gap-2"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="marketing-footer-link inline-flex items-center gap-2">
                        {link.label}
                        {link.badge && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            {link.badge}
                          </span>
                        )}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm font-serif italic" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Stay qrius.
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            &copy; {new Date().getFullYear()} Qrius Codes. All rights reserved.
            <span className="ml-2 opacity-50">v{MARKETING_VERSION}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

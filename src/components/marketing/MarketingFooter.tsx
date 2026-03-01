import { Link } from '@tanstack/react-router';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#' },
      { label: 'API', href: '#', badge: 'Soon' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { label: 'Restaurants', href: '#' },
      { label: 'Retail', href: '#' },
      { label: 'Events', href: '#' },
      { label: 'Agencies', href: '#' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'vs Bitly', href: '#' },
      { label: 'vs QR Code Generator', href: '#' },
      { label: 'vs Uniqode', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
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
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8"
        style={{ maxWidth: 1200 }}
      >
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h3
                className="text-sm font-semibold uppercase mb-4"
                style={{ letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}
              >
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'internal' in link && link.internal ? (
                      <Link
                        to={link.href as '/terms' | '/privacy' | '/cookies'}
                        className="text-sm transition-colors inline-flex items-center gap-2"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm transition-colors inline-flex items-center gap-2"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                      >
                        {link.label}
                        {'badge' in link && (
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
          <p className="text-sm font-serif italic" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Stay qrius.
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} Qrius Codes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

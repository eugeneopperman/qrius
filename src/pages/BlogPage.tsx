import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Sample posts (placeholder until CMS integration) ───────────────
const categories = ['All', 'QR 101', 'How-to', 'Industry', 'Design', 'Product'];

const featuredPost = {
  title: 'Introducing Qrius Codes: the QR tool we wished existed',
  excerpt: 'The story behind the product, what makes it different, and an invitation to try it. Warm, honest, not hype-driven.',
  category: 'Product',
  date: 'March 2026',
  image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&fit=crop&q=80',
};

const posts = [
  {
    title: 'Static vs dynamic QR codes: which one do you actually need?',
    excerpt: 'Explain the difference, when each makes sense, and why dynamic codes are worth it for any business using QR codes in print.',
    category: 'QR 101',
    date: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&fit=crop&q=80',
  },
  {
    title: '5 QR code design mistakes that kill your scan rate',
    excerpt: 'Low contrast, tiny codes, no call-to-action frame, logo blocking too much of the code, wrong error correction level.',
    category: 'Design',
    date: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&fit=crop&q=80',
  },
  {
    title: 'How to put a QR code on your restaurant menu (the right way)',
    excerpt: 'Step-by-step guide from creation to placement. Tips on sizing, where to position, and what to link to.',
    category: 'How-to',
    date: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&fit=crop&q=80',
  },
  {
    title: "Why your QR codes die when you cancel — and how to avoid it",
    excerpt: "Explains the industry practice of deactivating codes, why it happens, and how to choose a provider that doesn't do this.",
    category: 'QR 101',
    date: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&fit=crop&q=80',
  },
];

export default function BlogPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

  const openSignUp = useCallback(() => { setAuthView('signup'); setShowAuthModal(true); }, []);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    if (isRootDomain) { window.location.href = getAppUrl('/dashboard'); return; }
    navigate({ to: '/dashboard' });
  }, [navigate]);

  const filteredPosts = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <MarketingLayout onSignUp={openSignUp}>
      <div ref={containerRef}>

        {/* ─── Hero ──────────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-12 !pb-8">
          <div className="max-w-3xl">
            <p className="marketing-overline mb-4 animate-on-scroll">Blog</p>
            <h1
              className="font-serif animate-on-scroll stagger-1"
              style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 16 }}
            >
              QR code tips, guides & news.
            </h1>
            <p className="animate-on-scroll stagger-2" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}>
              Practical, well-written content that educates and builds trust.
            </p>
          </div>
        </MarketingSection>

        {/* ─── Featured post ─────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-4 !pb-8">
          <div className="marketing-card overflow-hidden animate-on-scroll" style={{ padding: 0 }}>
            <div className="flex flex-col lg:flex-row">
              <img
                src={featuredPost.image}
                alt=""
                className="w-full lg:w-1/2 aspect-[16/9] lg:aspect-auto object-cover"
                loading="lazy"
              />
              <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center">
                <span
                  className="inline-block px-2.5 py-1 rounded text-xs font-semibold mb-4 self-start"
                  style={{ backgroundColor: '#FFF3E8', color: '#F97316' }}
                >
                  {featuredPost.category}
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 8, lineHeight: 1.3 }}>
                  {featuredPost.title}
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4A4A4A', marginBottom: 16 }}>
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>{featuredPost.date}</span>
                  <span className="marketing-link">
                    Read more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </MarketingSection>

        {/* ─── Category filter ───────────────────────────────── */}
        <MarketingSection bg="cloud" className="!pt-8 !pb-4">
          <div className="flex flex-wrap gap-2 animate-on-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeCategory === cat ? '#F97316' : '#ffffff',
                  color: activeCategory === cat ? '#ffffff' : '#4A4A4A',
                  border: `1px solid ${activeCategory === cat ? '#F97316' : '#E8E6E3'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </MarketingSection>

        {/* ─── Post grid ─────────────────────────────────────── */}
        <MarketingSection bg="cloud" className="!pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredPosts.map((post, i) => (
              <div key={post.title} className={`marketing-card overflow-hidden animate-on-scroll stagger-${(i % 2) + 1}`} style={{ padding: 0 }}>
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    className="w-full aspect-[16/9] object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-5">
                  <span
                    className="inline-block px-2.5 py-1 rounded text-xs font-semibold mb-3"
                    style={{ backgroundColor: '#FFF3E8', color: '#F97316' }}
                  >
                    {post.category}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.3 }}>
                    {post.title}
                  </h3>
                  <p className="line-clamp-2" style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', marginBottom: 12 }}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>{post.date}</span>
                    <span className="marketing-link text-sm">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <p className="text-center py-12" style={{ fontSize: 16, color: '#9CA3AF' }}>
              No posts in this category yet. Check back soon!
            </p>
          )}
        </MarketingSection>

        {/* ─── Newsletter ────────────────────────────────────── */}
        <MarketingSection bg="snow">
          <div className="max-w-lg mx-auto text-center animate-on-scroll">
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
              Get QR tips and product updates.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: '#4A4A4A', marginBottom: 20 }}>
              No spam — just the good stuff.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 rounded-lg px-4 py-3"
                style={{ fontSize: 15, border: '1px solid #E8E6E3', backgroundColor: '#ffffff', color: '#1A1A1A' }}
              />
              <button type="submit" className="marketing-btn-primary whitespace-nowrap" style={{ padding: '12px 24px' }}>
                Subscribe
              </button>
            </form>
          </div>
        </MarketingSection>

        <CTASection
          headline="Ready to get qrius?"
          subheadline="Create your first QR code in under a minute. Free, no credit card, no strings."
          primaryLabel="Try Qrius Codes free"
          primaryAction={openSignUp}
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}

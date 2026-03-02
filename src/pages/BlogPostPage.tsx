import { useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';
import { getPostBySlug, blogPosts } from '@/data/blogPosts';
import type { BlogPost } from '@/data/blogPosts';

function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="marketing-card overflow-hidden transition-shadow hover:shadow-md"
      style={{ padding: 0, textDecoration: 'none', color: 'inherit' }}
    >
      <img
        src={post.image}
        alt=""
        className="w-full aspect-[16/9] object-cover"
        loading="lazy"
      />
      <div className="p-5">
        <span
          className="inline-block px-2.5 py-1 rounded text-xs font-semibold mb-3"
          style={{ backgroundColor: '#FFF3E8', color: '#F97316' }}
        >
          {post.category}
        </span>
        <h3
          className="line-clamp-2"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </h3>
        <p
          className="line-clamp-2"
          style={{ fontSize: 14, lineHeight: 1.5, color: '#4A4A4A' }}
        >
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const post = getPostBySlug(slug);
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');

  const openSignUp = useCallback(() => {
    setAuthView('signup');
    setShowAuthModal(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    if (isRootDomain) {
      window.location.href = getAppUrl('/dashboard');
      return;
    }
    navigate({ to: '/dashboard' });
  }, [navigate]);

  // ─── 404 for unknown slug ───────────────────────────────────────
  if (!post) {
    return (
      <MarketingLayout onSignUp={openSignUp}>
        <MarketingSection bg="snow" className="!py-20">
          <div className="max-w-xl mx-auto text-center">
            <h1
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: 12,
              }}
            >
              Post not found
            </h1>
            <p
              style={{ fontSize: 16, color: '#4A4A4A', marginBottom: 24 }}
            >
              That article doesn't exist — but the blog has plenty more.
            </p>
            <Link
              to="/blog"
              className="marketing-btn-primary inline-block"
              style={{ padding: '12px 24px' }}
            >
              Back to blog
            </Link>
          </div>
        </MarketingSection>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultView={authView}
          onAuthSuccess={handleAuthSuccess}
        />
      </MarketingLayout>
    );
  }

  // ─── Related posts (same category, excluding current, max 3) ───
  const related = blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      // Same category first, then by date
      if (a.category === post.category && b.category !== post.category) return -1;
      if (b.category === post.category && a.category !== post.category) return 1;
      return b.isoDate.localeCompare(a.isoDate);
    })
    .slice(0, 3);

  return (
    <MarketingLayout onSignUp={openSignUp}>
      <div ref={containerRef}>
        {/* ─── Back link ─────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-6 !pb-0">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#F97316' }}
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
          </Link>
        </MarketingSection>

        {/* ─── Article header ────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-6 !pb-4">
          <div className="max-w-3xl animate-on-scroll">
            <span
              className="inline-block px-3 py-1 rounded text-xs font-semibold mb-4"
              style={{ backgroundColor: '#FFF3E8', color: '#F97316' }}
            >
              {post.category}
            </span>
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
                marginBottom: 16,
              }}
            >
              {post.title}
            </h1>
            <div
              className="flex flex-wrap items-center gap-4"
              style={{ fontSize: 14, color: '#9CA3AF' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.isoDate}>{post.date}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </MarketingSection>

        {/* ─── Hero image ────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-4 !pb-8">
          <div className="animate-on-scroll stagger-1">
            <img
              src={post.image}
              alt=""
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: 440 }}
              loading="eager"
            />
          </div>
        </MarketingSection>

        {/* ─── Article body ──────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-0 !pb-12">
          <article
            className="prose animate-on-scroll stagger-2"
            style={{
              maxWidth: 720,
              fontSize: 17,
              lineHeight: 1.75,
              color: '#2A2A2A',
            }}
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </MarketingSection>

        {/* ─── Related posts ─────────────────────────────────── */}
        {related.length > 0 && (
          <MarketingSection bg="cloud">
            <div className="animate-on-scroll">
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: 24,
                }}
              >
                Keep reading
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((r) => (
                  <RelatedPostCard key={r.slug} post={r} />
                ))}
              </div>
            </div>
          </MarketingSection>
        )}

        <CTASection
          headline="Ready to get qrius?"
          subheadline="Create your first QR code in under a minute. Free, no credit card, no strings."
          primaryLabel="Try Qrius Codes free"
          primaryAction={openSignUp}
        />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView={authView}
        onAuthSuccess={handleAuthSuccess}
      />
    </MarketingLayout>
  );
}

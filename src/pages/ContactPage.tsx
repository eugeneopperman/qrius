import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Send, Mail, MessageCircle } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

const subjects = ['General question', 'Product support', 'Sales & pricing', 'Partnership', 'Press & media'];

export default function ContactPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

  const openSignUp = useCallback(() => { setAuthView('signup'); setShowAuthModal(true); }, []);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    if (isRootDomain) { window.location.href = getAppUrl('/dashboard'); return; }
    navigate({ to: '/dashboard' });
  }, [navigate]);

  return (
    <MarketingLayout onSignUp={openSignUp}>
      <div ref={containerRef}>

        {/* ─── Hero ──────────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-12 !pb-8">
          <div className="max-w-2xl">
            <h1
              className="font-serif animate-on-scroll"
              style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 20 }}
            >
              Got a question? We're real people.
            </h1>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}>
              Whether it's a product question, a feature request, or just a hello — we'd love to hear from you. We typically respond within one business day.
            </p>
          </div>
        </MarketingSection>

        {/* ─── Contact form + sidebar ────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-4">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Form */}
            <div className="flex-1 max-w-xl animate-on-scroll">
              <form
                onSubmit={(e) => { e.preventDefault(); }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="contact-name" className="block mb-1.5" style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    className="w-full rounded-lg px-4 py-3"
                    style={{ fontSize: 15, border: '1px solid #E8E6E3', backgroundColor: '#ffffff', color: '#1A1A1A' }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block mb-1.5" style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    className="w-full rounded-lg px-4 py-3"
                    style={{ fontSize: 15, border: '1px solid #E8E6E3', backgroundColor: '#ffffff', color: '#1A1A1A' }}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block mb-1.5" style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Subject</label>
                  <select
                    id="contact-subject"
                    required
                    className="w-full rounded-lg px-4 py-3 appearance-none"
                    style={{ fontSize: 15, border: '1px solid #E8E6E3', backgroundColor: '#ffffff', color: '#1A1A1A' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a topic</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block mb-1.5" style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={6}
                    className="w-full rounded-lg px-4 py-3 resize-y"
                    style={{ fontSize: 15, border: '1px solid #E8E6E3', backgroundColor: '#ffffff', color: '#1A1A1A' }}
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button type="submit" className="marketing-btn-primary w-full sm:w-auto flex items-center gap-2" style={{ padding: '12px 24px' }}>
                  <Send className="w-4 h-4" />
                  Send message
                </button>
              </form>
              <p className="mt-4" style={{ fontSize: 14, color: '#9CA3AF' }}>
                Or just email us directly: <a href="mailto:hello@qrius.app" style={{ color: '#F97316', fontWeight: 500 }}>hello@qrius.app</a>
              </p>
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 space-y-6 animate-on-scroll stagger-2">
              <div className="marketing-card">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF3E8' }}>
                  <Mail className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>Email</h3>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: '#4A4A4A' }}>
                  <a href="mailto:hello@qrius.app" style={{ color: '#F97316' }}>hello@qrius.app</a>
                </p>
              </div>

              <div className="marketing-card">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF3E8' }}>
                  <MessageCircle className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>Social</h3>
                <div className="space-y-1" style={{ fontSize: 14, color: '#4A4A4A' }}>
                  <p>Twitter / X: <span style={{ color: '#F97316' }}>@qriuscodes</span></p>
                  <p>LinkedIn: <span style={{ color: '#F97316' }}>Qrius Codes</span></p>
                </div>
              </div>

              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: '#F5F4F2', border: '1px solid #E8E6E3' }}
              >
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4A4A4A' }}>
                  We read everything. If you're reporting a bug or something urgent, mention it in the subject — it helps us prioritize. We aim to reply within one business day.
                </p>
              </div>
            </div>
          </div>
        </MarketingSection>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}

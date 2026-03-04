import { ComparisonPageTemplate, type ComparisonPageData } from '@/components/marketing/ComparisonPageTemplate';

const data: ComparisonPageData = {
  competitor: 'Bitly',
  hero: {
    headline: 'Qrius Codes vs Bitly',
    subheadline: "Bitly is a great link shortener. But if you need more than URL-only QR codes, there's a better fit.",
  },
  verdict: {
    body: [
      "Bitly built its QR codes as an add-on to a link shortening platform. Qrius Codes was built from the ground up for QR codes — with 9 code types, deeper customization, and pricing that doesn't charge $29 for 10 codes.",
      "If you just need short links with an occasional QR code, Bitly works fine. If QR codes are a real part of your marketing — menus, events, packaging, campaigns — Qrius gives you more for less.",
    ],
  },
  table: {
    columns: [
      { key: 'qrius', label: 'Qrius', highlight: true },
      { key: 'bitly', label: 'Bitly' },
    ],
    rows: [
      { feature: 'Free dynamic QR codes', values: { qrius: '5', bitly: '2/month' } },
      { feature: 'Free plan scans', values: { qrius: 'Unlimited', bitly: 'Unlimited (with ads)' } },
      { feature: 'QR code types', values: { qrius: '9 (URL, vCard, WiFi, etc.)', bitly: '1 (URL only)' } },
      { feature: 'Paid plan starting at', values: { qrius: '$12/mo (50 codes)', bitly: '$10/mo (5 codes)' } },
      { feature: '500 codes tier', values: { qrius: '$29/mo (Pro)', bitly: '$199/mo (Premium)' } },
      { feature: 'Logo & brand colors', values: { qrius: 'All plans', bitly: 'Paid only' } },
      { feature: 'Scan analytics', values: { qrius: 'All plans', bitly: 'Paid only' } },
      { feature: 'PDF download', values: { qrius: true, bitly: false } },
      { feature: 'Monthly billing', values: { qrius: true, bitly: false } },
      { feature: 'Codes survive cancellation', values: { qrius: true, bitly: false } },
      { feature: 'Custom domain', values: { qrius: 'Business plan', bitly: 'Growth+ ($29/mo)' } },
      { feature: 'Team members (entry paid)', values: { qrius: '5', bitly: '1' } },
    ],
  },
  wins: {
    headline: 'Where Qrius wins.',
    items: [
      { title: 'Nine QR code types vs one.', description: "Bitly QR codes are URL redirects — period. Qrius supports vCard, WiFi, Email, Phone, SMS, Event, Location, and Text codes. If you want a WiFi code for your cafe or a vCard for your sales team, Bitly simply can't do it." },
      { title: 'More codes for a fraction of the price.', description: "Bitly's Growth plan gives you 10 QR codes for $29/month. Qrius Pro gives you 500 for $29/month. That's 50x the codes at the same price." },
      { title: 'Analytics on every plan.', description: 'Bitly gates scan analytics behind paid plans. On Qrius, every user — including free — gets location, device, and time-of-day data.' },
      { title: 'No ads on the free plan.', description: 'Bitly introduced interstitial ad pages on free QR code scans in 2025. Qrius free codes go straight to the destination. No ads, no delays.' },
    ],
  },
  concessions: {
    headline: 'Where Bitly might be a better fit.',
    items: [
      { title: 'Link shortener first, QR codes second.', description: "Bitly's core product is link shortening with a unified dashboard for links, QR codes, and landing pages. If your primary need is managing short URLs, Bitly's ecosystem is built for that." },
      { title: "Deep in the Bitly ecosystem already.", description: 'Migrating hundreds of existing short links and QR codes has a switching cost. If your current volume is low and Bitly\'s working for you, the friction of moving may not be worth it yet.' },
    ],
  },
  switching: {
    headline: 'Switching is easy.',
    body: [
      "There's no import process needed. Just create your new codes on Qrius, print or distribute them, and let the old Bitly codes wind down naturally.",
      'For printed materials — we get it, that\'s the hard part. As those materials cycle out naturally (new menus, new business cards, new signage), replace the old codes with Qrius codes.',
    ],
  },
  cta: {
    headline: 'More types. More codes. Less money. Same scan.',
  },
};

export default function BitlyPage() {
  return <ComparisonPageTemplate data={data} />;
}

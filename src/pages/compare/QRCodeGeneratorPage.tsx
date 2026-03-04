import { ComparisonPageTemplate, type ComparisonPageData } from '@/components/marketing/ComparisonPageTemplate';

const data: ComparisonPageData = {
  competitor: 'QR Code Generator',
  hero: {
    headline: 'Qrius Codes vs QR Code Generator',
    subheadline: "If you've been surprised by a billing charge or had a QR code stop working — you're not alone. Here's how we do things differently.",
  },
  callout: {
    type: 'rating',
    text: 'QR Code Generator (qr-code-generator.com) has a 1.6-star rating on Trustpilot from over 9,000 reviews, mostly around surprise charges, codes deactivating after a trial, and no-refund policies.',
  },
  verdict: {
    body: [
      'QR Code Generator has the name advantage — it\'s literally "QR Code Generator." But the product experience tells a different story.',
      'Qrius Codes was built to be the opposite: transparent pricing, codes that keep working, and a free plan that\'s genuinely free.',
    ],
  },
  table: {
    columns: [
      { key: 'qrius', label: 'Qrius', highlight: true },
      { key: 'qrcg', label: 'QR Code Gen' },
    ],
    rows: [
      { feature: 'Free dynamic QR codes', values: { qrius: '5', qrcg: '1 (14-day trial)' } },
      { feature: 'Free plan scans', values: { qrius: 'Unlimited', qrcg: 'No tracking' } },
      { feature: 'Monthly billing', values: { qrius: true, qrcg: false } },
      { feature: 'Codes survive cancellation', values: { qrius: true, qrcg: false } },
      { feature: 'Refund policy', values: { qrius: '14-day guarantee', qrcg: 'No refunds' } },
      { feature: 'Paid plan starting at', values: { qrius: '$12/mo', qrcg: '~$8/mo (annual: ~$96 upfront)' } },
      { feature: 'Customization on free', values: { qrius: 'Full', qrcg: 'Limited' } },
      { feature: 'Scan analytics on free', values: { qrius: true, qrcg: false } },
      { feature: 'Team members (Pro)', values: { qrius: '5', qrcg: '2' } },
    ],
  },
  wins: {
    headline: 'Where Qrius wins.',
    items: [
      { title: 'Your free codes actually stay free.', description: "QR Code Generator's free \"dynamic\" code is a 14-day trial. After that, it deactivates. If you've already printed it on 500 wedding invitations, that's your problem — not theirs. On Qrius, free means free." },
      { title: 'Monthly billing, for real.', description: 'QR Code Generator shows monthly prices but charges the full year upfront. Users regularly report being charged $129-$178 when they expected $8-$12. On Qrius, monthly is monthly.' },
      { title: "Codes don't die when you leave.", description: 'Cancel your subscription, and every dynamic code stops working. Every menu, every flyer, every business card — dead. On Qrius, your codes keep redirecting after cancellation.' },
      { title: 'Transparent about everything.', description: "We put our limits on the pricing page, not in the terms of service. We don't auto-renew without warning. And if you want to cancel, there's a button — not a support ticket maze." },
    ],
  },
  concessions: {
    headline: 'Where QR Code Generator might work.',
    items: [
      { title: 'Batch creation at enterprise scale.', description: "Their higher tiers offer bulk generation features and enterprise-specific tools that Qrius hasn't built yet." },
      { title: 'EPS vector format.', description: 'They offer EPS downloads alongside SVG — a nice-to-have for certain print workflows.' },
    ],
  },
  cta: {
    headline: "QR codes shouldn't come with trust issues.",
  },
};

export default function QRCodeGeneratorPage() {
  return <ComparisonPageTemplate data={data} />;
}

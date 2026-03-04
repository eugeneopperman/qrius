import { ComparisonPageTemplate, type ComparisonPageData } from '@/components/marketing/ComparisonPageTemplate';

const data: ComparisonPageData = {
  competitor: 'Flowcode',
  hero: {
    headline: 'Qrius Codes vs Flowcode',
    subheadline: "Flowcode is built for Fortune 500 budgets. Qrius Codes is built for everyone else.",
  },
  callout: {
    type: 'price',
    text: "Flowcode's analytics with geo data starts at $250/month. Team collaboration starts at $750/month. Qrius offers both starting at $29/month.",
  },
  verdict: {
    body: [
      "Flowcode positions itself as an enterprise \"offline-to-online conversion platform\" trusted by 75% of the Fortune 500. It's polished, compliance-ready, and deeply integrated with enterprise CRMs. It's also $250/month to get meaningful analytics and $750/month for team features.",
      "If you're a Fortune 500 company with a dedicated QR code budget, Flowcode is built for you. If you're a business that just needs great QR codes with real analytics at a price that makes sense — that's us.",
    ],
  },
  table: {
    columns: [
      { key: 'qrius', label: 'Qrius', highlight: true },
      { key: 'flowcode', label: 'Flowcode' },
    ],
    rows: [
      { feature: 'Free dynamic QR codes', values: { qrius: '5', flowcode: '2' } },
      { feature: 'Free plan scans', values: { qrius: 'Unlimited', flowcode: '500 total' } },
      { feature: 'Analytics with geo data', values: { qrius: '$12/mo (Starter)', flowcode: '$250/mo' } },
      { feature: 'Team collaboration', values: { qrius: '$29/mo (5 members)', flowcode: '$750/mo' } },
      { feature: 'Customization depth', values: { qrius: 'Full', flowcode: 'Limited palette' } },
      { feature: 'CRM integrations', values: { qrius: false, flowcode: true } },
      { feature: 'SOC 2 / GDPR', values: { qrius: false, flowcode: true } },
    ],
  },
  wins: {
    headline: 'Where Qrius wins.',
    items: [
      { title: 'Accessible pricing.', description: "Qrius Starter at $12/month includes analytics that Flowcode gates behind their $250/month Growth tier. For a small business, that's not a comparison — it's a different universe." },
      { title: 'A real free plan.', description: "Flowcode's free tier gives you 2 codes and 500 total scans. After that, you're done. Qrius gives you 5 dynamic codes with unlimited scans, ongoing." },
      { title: 'Design freedom.', description: "Flowcode's QR code builder has limited color palettes. Qrius gives you full control over colors, gradients, dot patterns, corner styles, logos, and frames." },
    ],
  },
  concessions: {
    headline: 'Where Flowcode might be a better fit.',
    items: [
      { title: 'Enterprise CRM integration.', description: "If you need native Salesforce, HubSpot, or Snowflake integration for offline-to-online attribution, Flowcode has built that pipeline." },
      { title: 'Enterprise compliance and SLAs.', description: 'Flowcode offers SOC 2, GDPR, CCPA compliance, and 99.9% uptime SLAs on enterprise plans.' },
      { title: 'Audience retargeting.', description: "Flowcode's higher tiers include audience builder tools and retargeting capabilities that go beyond standard scan analytics." },
    ],
  },
  cta: {
    headline: "You don't need a Fortune 500 budget for Fortune 500 quality.",
  },
};

export default function FlowcodePage() {
  return <ComparisonPageTemplate data={data} />;
}

import { ComparisonPageTemplate, type ComparisonPageData } from '@/components/marketing/ComparisonPageTemplate';

const data: ComparisonPageData = {
  competitor: 'Uniqode',
  hero: {
    headline: 'Qrius Codes vs Uniqode',
    subheadline: "Uniqode is built for enterprise. Qrius Codes is built for everyone — with plans starting at $12/month.",
  },
  callout: {
    type: 'price',
    text: "Uniqode's pricing starts at $9/month for 50 codes with annual billing only, jumps to $49 for 250 codes, and reserves team features for the $99+ tiers. Qrius offers 500 codes with team features for $29/month.",
  },
  verdict: {
    body: [
      'Uniqode (formerly Beaconstac) is a capable platform with strong enterprise compliance credentials (SOC 2, HIPAA). But their pricing reflects that positioning.',
      "If you're a mid-market company that needs HIPAA compliance, Uniqode has that. For everyone else, Qrius offers comparable features at a fraction of the price — with monthly billing and a free plan that actually includes dynamic codes.",
    ],
  },
  table: {
    columns: [
      { key: 'qrius', label: 'Qrius', highlight: true },
      { key: 'uniqode', label: 'Uniqode' },
    ],
    rows: [
      { feature: 'Free dynamic QR codes', values: { qrius: '5', uniqode: '0 (static only)' } },
      { feature: '500 dynamic codes', values: { qrius: '$29/mo (Pro)', uniqode: '$99/mo (Plus)' } },
      { feature: 'Monthly billing', values: { qrius: true, uniqode: false } },
      { feature: 'Scan analytics on free', values: { qrius: true, uniqode: false } },
      { feature: 'Data retention (entry paid)', values: { qrius: '1 year', uniqode: '60 days' } },
      { feature: 'Team members at $29/mo', values: { qrius: '5', uniqode: '1' } },
      { feature: 'Custom domain', values: { qrius: 'Pro ($29/mo)', uniqode: 'Add-on ($2,000/year)' } },
      { feature: 'Codes survive cancellation', values: { qrius: true, uniqode: false } },
      { feature: 'SOC 2 / HIPAA', values: { qrius: false, uniqode: true } },
    ],
  },
  wins: {
    headline: 'Where Qrius wins.',
    items: [
      { title: '3x cheaper for double the codes.', description: '500 dynamic codes costs $29/month on Qrius and $99/month on Uniqode for 500. Over a year, that\'s $348 vs $1,188.' },
      { title: 'A free plan with actual QR codes.', description: "Uniqode's free tier only makes static codes — no analytics, no editing, no dynamic behavior. Qrius gives you 5 dynamic codes with full analytics on the free plan." },
      { title: 'Longer data retention.', description: 'Uniqode keeps scan data for 60 days on their entry plan. Qrius keeps it for a year on Pro, and forever on Business.' },
      { title: "Custom domains that don't cost $2,000/year.", description: 'Uniqode charges $2,000 per year per custom domain as an add-on. On Qrius, custom domains start on Pro at $29/month, with unlimited domains on Business at $79/month.' },
    ],
  },
  concessions: {
    headline: 'Where Uniqode might be a better fit.',
    items: [
      { title: 'Enterprise compliance requirements.', description: 'If your organization needs SOC 2 Type 2, HIPAA, or ISO 27001 compliance for QR code data, Uniqode has those certifications today.' },
      { title: 'Bulk generation at massive scale.', description: 'Uniqode supports bulk creation of up to 50,000 static codes and has deeper enterprise-tier features for large deployments.' },
      { title: 'Digital business cards.', description: "Uniqode has a mature digital business card product with CRM integrations. Qrius has this on the roadmap but hasn't shipped it yet." },
    ],
  },
  cta: {
    headline: 'Enterprise features are great. But what if you just need great QR codes?',
  },
};

export default function UniqodePage() {
  return <ComparisonPageTemplate data={data} />;
}

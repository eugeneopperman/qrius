import { ComparisonPageTemplate, type ComparisonPageData } from '@/components/marketing/ComparisonPageTemplate';

const data: ComparisonPageData = {
  competitor: 'QR Tiger',
  hero: {
    headline: 'Qrius Codes vs QR Tiger',
    subheadline: "QR Tiger has a lot of features. Qrius Codes has the ones you'll actually use — in an interface you'll actually enjoy.",
  },
  verdict: {
    body: [
      "QR Tiger packs a lot into its platform — 20+ QR code types, bulk generation, integrations with Google Analytics and Zapier. But the experience can feel overwhelming, the free tier is heavily restricted (3 codes, 500 scans each, with a watermark popup), and codes can't be redesigned after creation.",
      'Qrius Codes focuses on doing fewer things exceptionally well — with a clean interface, a generous free plan, and the ability to update your codes anytime.',
    ],
  },
  table: {
    columns: [
      { key: 'qrius', label: 'Qrius', highlight: true },
      { key: 'tiger', label: 'QR Tiger' },
    ],
    rows: [
      { feature: 'Free dynamic QR codes', values: { qrius: '15 (no scan limit)', tiger: '3 (500 scans each)' } },
      { feature: 'Watermark on free', values: { qrius: false, tiger: true } },
      { feature: 'Edit design after creation', values: { qrius: true, tiger: false } },
      { feature: 'Paid plan starting at', values: { qrius: '$9/mo (250 codes)', tiger: '$7/mo (12 codes)' } },
      { feature: 'UI clarity', values: { qrius: 'Clean, minimal', tiger: 'Feature-dense' } },
      { feature: 'Codes survive cancellation', values: { qrius: true, tiger: false } },
      { feature: 'Monthly billing', values: { qrius: true, tiger: true } },
      { feature: 'QR code types', values: { qrius: '9', tiger: '20+' } },
    ],
  },
  wins: {
    headline: 'Where Qrius wins.',
    items: [
      { title: 'Cleaner, faster experience.', description: "QR Tiger's dashboard can feel like a control panel for a spaceship. Qrius is designed for people who want to create a QR code, not learn a new software platform." },
      { title: 'No watermarks, no scan limits on free.', description: "QR Tiger's free codes show a logo popup on scan and cap at 500 scans per code. Qrius free codes are clean and include 5,000 scans per month across all codes." },
      { title: 'Edit your designs.', description: "On QR Tiger, once a QR code is created, you can't change its design — only its destination. On Qrius, you can update both." },
    ],
  },
  concessions: {
    headline: 'Where QR Tiger might be a better fit.',
    items: [
      { title: '20+ QR code types.', description: "QR Tiger supports code types Qrius doesn't yet — like App Store links, multi-URL codes, and file upload codes. If you need those specific types, QR Tiger has them." },
      { title: 'Zapier/GA integrations today.', description: "QR Tiger has built-in integrations with Google Analytics, Zapier, HubSpot, and Canva that Qrius doesn't offer yet." },
    ],
  },
  cta: {
    headline: 'Sometimes less is more. Especially when "less" means less confusion.',
  },
};

export default function QRTigerPage() {
  return <ComparisonPageTemplate data={data} />;
}

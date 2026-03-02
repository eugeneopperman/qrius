import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { Package, Tag, Heart, MessageSquare } from 'lucide-react';

const data: UseCasePageData = {
  breadcrumbLabel: 'Retail',
  hero: {
    headline: 'QR codes that sell as hard as your products.',
    subheadline: 'Product info, promotions, loyalty programs, and reviews — on the shelf, on the packaging, or at the register.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&fit=crop&q=80',
  },
  problem: {
    headline: 'Your packaging says a lot. It could say more.',
    body: "There's only so much you can fit on a label. But a QR code turns a small square into a gateway — to ingredient lists, how-to videos, loyalty signups, or a \"buy it again\" page. The question isn't whether to add a QR code. It's whether yours will be worth scanning.",
  },
  useCases: {
    headline: 'How retailers use Qrius Codes.',
    layout: 'stack',
    items: [
      { icon: Package, title: 'Product information', description: 'Link to detailed specs, ingredient lists, sizing guides, or how-to videos. Give customers the depth they want without cluttering your packaging.' },
      { icon: Tag, title: 'Promotions & discounts', description: 'Run limited-time offers with a QR code on shelf talkers or window displays. Change the promotion without replacing the signage.' },
      { icon: Heart, title: 'Loyalty programs', description: 'Link to your signup page with one scan. No app download, no typing URLs. Just scan and join.' },
      { icon: MessageSquare, title: 'Customer reviews', description: 'Put a review QR code next to your bestsellers. Social proof right at the point of decision.' },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for retail.',
    items: [
      { title: 'Branded and beautiful.', description: 'Your product packaging is designed to the millimeter. Your QR code should be too — your colors, your logo, your style.' },
      { title: 'Updatable promotions.', description: 'The Black Friday code can become the New Year code can become the Spring Sale code. One print, endless campaigns.' },
      { title: 'Data at the shelf level.', description: 'Which products get the most scans? Which store locations drive more engagement? Analytics that tell you what\'s working where.' },
    ],
  },
  cta: {
    headline: 'Turn every label into a conversation.',
  },
};

export default function RetailPage() {
  return <UseCasePageTemplate data={data} />;
}

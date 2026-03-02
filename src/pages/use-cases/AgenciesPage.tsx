import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { FolderOpen, Layers, Globe, BarChart3 } from 'lucide-react';

const data: UseCasePageData = {
  hero: {
    headline: 'Manage QR codes across every client. Without losing your mind.',
    subheadline: 'Brand templates, team access, white-label options, and analytics your clients will actually understand.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&fit=crop&q=80',
  },
  useCases: {
    headline: 'How agencies use Qrius Codes.',
    layout: 'stack',
    items: [
      { icon: FolderOpen, title: 'Client campaign management', description: 'Create folders per client. Organize codes by campaign. Keep everything separated and searchable — even when you\'re running 20 campaigns at once.' },
      { icon: Layers, title: 'Brand templates', description: "Save each client's brand style — colors, logo, dot patterns, frame labels — as a reusable template. Apply it in one click to every new code. Consistency across campaigns without the manual work." },
      { icon: Globe, title: 'White-label delivery', description: "On the Business plan, use custom domains so your clients' QR codes resolve through their own brand — not through ours. Their name, their URL, their trust." },
      { icon: BarChart3, title: 'Client reporting', description: "Pull up scan analytics per code, per campaign, or per folder. Show clients exactly how their physical marketing is performing — with data, not guesswork." },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for agencies.',
    items: [
      { title: 'Scale without mess.', description: 'Templates and folders keep 50 clients as organized as 5. Role-based access lets team members manage their accounts without stepping on each other.' },
      { title: 'Price that works for agencies.', description: "Business plan at $29/mo with unlimited codes and 25 team seats. That's a client-services margin you can actually live with." },
      { title: 'White-label when it matters.', description: "Custom domains on the Business plan mean your client's QR codes carry their brand — in the URL, not just the design." },
    ],
  },
  cta: {
    headline: 'Your clients deserve great QR codes. You deserve a tool that makes it easy.',
    secondaryLabel: 'See Business plan',
    secondaryHref: '/pricing',
  },
};

export default function AgenciesPage() {
  return <UseCasePageTemplate data={data} />;
}

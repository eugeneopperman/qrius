import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { Home, Video, User, ClipboardList } from 'lucide-react';

const data: UseCasePageData = {
  breadcrumbLabel: 'Real Estate',
  hero: {
    headline: 'QR codes that open doors. Figuratively, at least.',
    subheadline: 'Listing details, virtual tours, agent contact cards, and open house sign-ins — all from one scan.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&fit=crop&q=80',
  },
  useCases: {
    headline: 'How agents use Qrius Codes.',
    layout: 'grid-2',
    items: [
      { icon: Home, title: 'Listing details', description: 'A QR code on the yard sign links to the full listing — photos, floor plan, price, and neighborhood info. Buyers get what they want without calling first.' },
      { icon: Video, title: 'Virtual tours', description: 'Link directly to a Matterport or video walkthrough. Prospective buyers can tour the property from the sidewalk.' },
      { icon: User, title: 'Agent contact (vCard)', description: 'A vCard QR code on your business card, flyer, or sign saves your full contact info to their phone in one scan. No typing, no lost cards.' },
      { icon: ClipboardList, title: 'Open house sign-in', description: 'Replace the clipboard. A QR code at the door links to a Google Form or sign-in page. Cleaner, faster, and you get the data digitally.' },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for real estate.',
    items: [
      { title: 'One sign, many listings.', description: 'Reuse the same yard sign frame — just update which listing the code points to. Sold the house? Point the code to your next listing.' },
      { title: 'Professional presentation.', description: 'Your codes match your brokerage branding. Colors, logo, and a frame that says "Scan for details" — not a generic black square taped to a post.' },
      { title: 'Track interest.', description: 'Know how many people scanned your listing, when they did it, and what device they used. Data that helps you report back to sellers with confidence.' },
    ],
  },
  cta: {
    headline: 'The listing speaks for itself. The code just opens the door.',
  },
};

export default function RealEstatePage() {
  return <UseCasePageTemplate data={data} />;
}

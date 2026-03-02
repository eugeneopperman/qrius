import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { ClipboardList, Calendar, Map, FileText } from 'lucide-react';

const data: UseCasePageData = {
  breadcrumbLabel: 'Healthcare',
  hero: {
    headline: 'QR codes that help people find what they need — fast.',
    subheadline: 'Patient intake forms, appointment booking, wayfinding, and information sheets — all accessible in one scan.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&fit=crop&q=80',
  },
  useCases: {
    headline: 'How healthcare providers use Qrius Codes.',
    layout: 'grid-3',
    items: [
      { icon: ClipboardList, title: 'Patient intake forms', description: 'Replace the clipboard in the waiting room. A QR code on the check-in desk links to a digital form patients can fill out on their phone.' },
      { icon: Calendar, title: 'Appointment booking', description: 'QR codes on appointment cards, referral letters, or posters link directly to your scheduling page. Fewer phone calls, faster bookings.' },
      { icon: Map, title: 'Wayfinding', description: 'Help patients and visitors navigate large facilities. QR codes on signs link to interactive maps or department-specific directions.' },
      { icon: FileText, title: 'Medication & health info', description: 'Link to patient-facing educational materials — drug information, post-procedure care instructions, or wellness resources.' },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for healthcare.',
    items: [
      { title: 'Less paper, fewer bottlenecks.', description: 'Digital forms and self-service booking reduce waiting room friction and administrative overhead.' },
      { title: 'Update materials centrally.', description: 'Changed your intake form? Updated visiting hours? Update the link — no need to reprint signage across the facility.' },
      { title: 'Accessible and familiar.', description: 'Patients already know how to scan a QR code. No app downloads, no special instructions.' },
    ],
  },
  cta: {
    headline: 'Better access starts with a simple scan.',
  },
};

export default function HealthcarePage() {
  return <UseCasePageTemplate data={data} />;
}

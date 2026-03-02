import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { CalendarDays, Ticket, User, MessageSquare, Clock } from 'lucide-react';

const data: UseCasePageData = {
  hero: {
    headline: 'QR codes that make your event feel effortless.',
    subheadline: 'Schedules, tickets, check-in, speaker bios, feedback forms — everything your attendees need, one scan away.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80',
  },
  problem: {
    headline: "Events have a hundred moving pieces. QR codes shouldn't be one of them.",
    body: "You've booked the venue, lined up the speakers, and printed the badges. The last thing you need is to be fiddling with a QR code tool that won't let you update the schedule link after you've already sent the programs to print.",
  },
  useCases: {
    headline: 'How event organizers use Qrius Codes.',
    layout: 'alternating',
    items: [
      { icon: CalendarDays, title: 'Schedules & agendas', description: 'One code on the program links to the full, always-current schedule. Speaker change at the last minute? Update the link. No reprints.' },
      { icon: Ticket, title: 'Tickets & check-in', description: 'Generate unique QR codes for ticket verification. Fast scanning, clean check-in, no paper waste.' },
      { icon: User, title: 'Speaker & sponsor info', description: 'Link attendee badges or program pages to speaker bios, LinkedIn profiles, or sponsor websites.' },
      { icon: MessageSquare, title: 'Post-event feedback', description: 'Put a QR code on the exit signage or closing slide. One scan opens your survey. Capture feedback while the experience is fresh.' },
      { icon: Clock, title: 'Calendar events', description: "Create Event-type QR codes that add sessions directly to attendees' calendars. No copy-paste, no manual entry." },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for events.',
    items: [
      { title: 'Last-minute changes, no problem.', description: 'Updated room assignments, swapped speakers, shifted timing — update the destination URL and the printed code stays current.' },
      { title: 'Know your audience.', description: 'See which sessions drove the most scans, which sponsors got the most engagement, and whether the main stage or the breakout rooms had more traffic.' },
      { title: 'On-brand everything.', description: 'Your event has a visual identity. Your codes should carry it — colors, logos, and a "Scan for schedule" frame that fits the aesthetic.' },
    ],
  },
  cta: {
    headline: 'Your event deserves better than a generic black square.',
  },
};

export default function EventsPage() {
  return <UseCasePageTemplate data={data} />;
}

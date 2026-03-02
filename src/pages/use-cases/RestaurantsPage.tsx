import { UseCasePageTemplate, type UseCasePageData } from '@/components/marketing/UseCasePageTemplate';
import { UtensilsCrossed, Wifi, Star, CalendarDays } from 'lucide-react';

const data: UseCasePageData = {
  breadcrumbLabel: 'Restaurants',
  hero: {
    headline: 'QR codes made for restaurants that care about the details.',
    subheadline: 'Digital menus, WiFi access, review links, and more — all branded, all trackable, and all updatable without reprinting a thing.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop&q=80',
  },
  problem: {
    headline: "You've got better things to do than reprint menus.",
    body: [
      "Seasonal menu change? New prices? Added a lunch special? With a traditional printed menu, every update means a trip to the printer. With a static QR code from a free tool, you're stuck with an ugly square that looks like it wandered in from a parking garage.",
      'Your restaurant has a vibe. Your QR codes should match it.',
    ],
  },
  useCases: {
    headline: 'How restaurants use Qrius Codes.',
    layout: 'grid-2',
    items: [
      { icon: UtensilsCrossed, title: 'Digital menus', description: 'Link your QR code to your online menu — PDF, website, or ordering platform. Update the menu anytime, and the same printed code takes customers to the latest version.', context: 'Perfect for: table tents, counter displays, window signage, takeout bags.' },
      { icon: Wifi, title: 'WiFi access', description: 'Create a WiFi QR code with your network name and password built in. Customers scan and connect — no more writing your password on a chalkboard.', context: 'Perfect for: table cards, wall signs, welcome packets.' },
      { icon: Star, title: 'Google review links', description: 'Make it effortless for happy customers to leave a review. A QR code on the check or receipt takes them straight to your Google review page.', context: 'Perfect for: receipts, table cards, near the exit.' },
      { icon: CalendarDays, title: 'Event & special promotions', description: 'Running a wine night? A live music event? Create a QR code that links to the event details and add it to your calendar with one scan.', context: 'Perfect for: flyers, posters, social media.' },
    ],
  },
  benefits: {
    headline: 'Why Qrius Codes for your restaurant.',
    items: [
      { title: "It looks like yours.", description: "Match your brand colors, add your logo, choose a style that fits your restaurant's personality. A QR code on a craft cocktail menu should look different than one on a fast-casual tray liner." },
      { title: 'Update without reprinting.', description: 'Changed your menu? New hours? Swapped delivery platforms? Update the destination from your dashboard. The printed code stays the same.' },
      { title: "See what's working.", description: 'Know which QR codes get scanned most, what time of day your customers are engaging, and whether that new table tent design is actually performing better.' },
    ],
  },
  scenario: {
    headline: 'A week at your restaurant, with Qrius Codes.',
    items: [
      { label: 'Monday', text: 'You update the weekly specials — just change the menu link in your dashboard.' },
      { label: 'Wednesday', text: 'You check analytics and notice the counter code gets 3x more scans than the window code. You move the window code to the host stand instead.' },
      { label: 'Friday', text: 'A customer scans the WiFi code and connects in two seconds. They post a photo with your location tagged. You didn\'t do anything — the code did it.' },
      { label: 'Saturday', text: "The review card on the table gets 12 scans. That's 12 chances at a 5-star Google review you didn't have to ask for out loud." },
    ],
  },
  cta: {
    headline: 'Your tables are set. Your codes should be too.',
  },
};

export default function RestaurantsPage() {
  return <UseCasePageTemplate data={data} />;
}

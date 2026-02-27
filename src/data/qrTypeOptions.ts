import {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  User,
  Calendar,
  MapPin,
} from 'lucide-react';
import type { QRCodeType } from '@/types';

export interface TypeOption {
  id: QRCodeType;
  label: string;
  icon: React.ElementType;
  description: string;
  example: string;
  animClass: string;
}

export const typeOptions: TypeOption[] = [
  { id: 'url', label: 'URL', icon: Link, description: 'Website link', example: 'https://example.com', animClass: 'icon-anim-link-wiggle' },
  { id: 'text', label: 'Text', icon: Type, description: 'Plain text message', example: 'Hello world!', animClass: 'icon-anim-type-shift' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Email address', example: 'hello@example.com', animClass: 'icon-anim-mail-open' },
  { id: 'phone', label: 'Phone', icon: Phone, description: 'Phone number', example: '+1 234 567 8900', animClass: 'icon-anim-ring' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message', example: 'Send a message', animClass: 'icon-anim-message-bounce' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'Network credentials', example: 'Join network', animClass: 'icon-anim-signal-pulse' },
  { id: 'vcard', label: 'vCard', icon: User, description: 'Contact card', example: 'Save contact', animClass: 'icon-anim-nod' },
  { id: 'event', label: 'Event', icon: Calendar, description: 'Calendar event', example: 'Add to calendar', animClass: 'icon-anim-page-flip' },
  { id: 'location', label: 'Location', icon: MapPin, description: 'Map coordinates', example: 'Open in maps', animClass: 'icon-anim-pin-drop' },
];

import { useQRStore } from '@/stores/qrStore';
import {
  UrlForm,
  TextForm,
  EmailForm,
  PhoneForm,
  SmsForm,
  WifiForm,
  VCardForm,
  EventForm,
  LocationForm,
} from './qr-types';

export function InputForm() {
  const activeType = useQRStore((s) => s.activeType);

  const renderForm = () => {
    switch (activeType) {
      case 'url':
        return <UrlForm />;
      case 'text':
        return <TextForm />;
      case 'email':
        return <EmailForm />;
      case 'phone':
        return <PhoneForm />;
      case 'sms':
        return <SmsForm />;
      case 'wifi':
        return <WifiForm />;
      case 'vcard':
        return <VCardForm />;
      case 'event':
        return <EventForm />;
      case 'location':
        return <LocationForm />;
      default:
        return <UrlForm />;
    }
  };

  return (
    <div className="card">
      <h2 className="section-title mb-4">Content</h2>
      {renderForm()}
    </div>
  );
}

import { useQRStore } from '@/stores/qrStore';
import { useWizardStore } from '@/stores/wizardStore';
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
} from '@/components/qr-types';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ArrowRight,
  Zap,
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

const typeConfig: Record<QRCodeType, { label: string; icon: React.ElementType }> = {
  url: { label: 'URL', icon: Link },
  text: { label: 'Plain Text', icon: Type },
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone Number', icon: Phone },
  sms: { label: 'SMS Message', icon: MessageSquare },
  wifi: { label: 'WiFi Network', icon: Wifi },
  vcard: { label: 'Contact Card', icon: User },
  event: { label: 'Calendar Event', icon: Calendar },
  location: { label: 'Location', icon: MapPin },
};

export function StepContent() {
  const { activeType, getQRValue } = useQRStore();
  const { nextStep, prevStep, skipToDownload } = useWizardStore();

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

  const hasContent = getQRValue().length > 0;
  const config = typeConfig[activeType] || typeConfig.url;
  const Icon = config.icon;

  return (
    <div className="w-full max-w-xl">
      <div className="card">
        {/* Compact header: icon badge + type name */}
        <div className="flex items-center gap-3 mb-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
              {config.label}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">Step 2 of 4</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="-mx-6 my-4 border-gray-100 dark:border-gray-800" />

        {/* Form content */}
        <div>
          {renderForm()}
        </div>

        {/* Divider */}
        <hr className="-mx-6 my-4 border-gray-100 dark:border-gray-800" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={skipToDownload}
              disabled={!hasContent}
              size="sm"
              title={!hasContent ? 'Enter content first' : 'Skip styling and download now'}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Download</span>
            </Button>

            <Button
              variant="primary"
              onClick={nextStep}
              disabled={!hasContent}
              size="sm"
            >
              Customize
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

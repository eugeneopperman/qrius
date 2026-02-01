import { useQRStore } from '../../../stores/qrStore';
import { useWizardStore } from '../../../stores/wizardStore';
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
} from '../../qr-types';
import { Button } from '../../ui/Button';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

const typeLabels: Record<string, string> = {
  url: 'URL',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  wifi: 'WiFi',
  vcard: 'Contact',
  event: 'Event',
  location: 'Location',
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

  // Check if the form has enough content to proceed
  const hasContent = getQRValue().length > 0;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
          Enter your {typeLabels[activeType] || 'content'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Fill in the details for your {typeLabels[activeType]?.toLowerCase()} QR code
        </p>
      </div>

      {/* Form content */}
      <div className="card mb-6">
        {renderForm()}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
          <Button
            variant="secondary"
            onClick={skipToDownload}
            disabled={!hasContent}
            title={!hasContent ? 'Enter content first' : 'Skip styling and download now'}
          >
            <Zap className="w-4 h-4" />
            Quick Download
          </Button>

          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!hasContent}
          >
            Customize
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

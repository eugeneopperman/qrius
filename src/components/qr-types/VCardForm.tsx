import { useState } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

import { validateEmail, validatePhone, validateUrl, validateName } from '@/utils/validators';

export function VCardForm() {
  const { vcardData, setVcardData } = useQRStore();
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
    website: false,
  });

  const nameValidation = touched.name
    ? validateName(vcardData.firstName, vcardData.lastName)
    : { isValid: true };
  const phoneValidation = touched.phone && vcardData.phone
    ? validatePhone(vcardData.phone)
    : { isValid: true };
  const emailValidation = touched.email && vcardData.email
    ? validateEmail(vcardData.email)
    : { isValid: true };
  const websiteValidation = touched.website && vcardData.website
    ? validateUrl(vcardData.website)
    : { isValid: true };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
          Personal Information
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name"
            type="text"
            required
            value={vcardData.firstName}
            onChange={(e) => setVcardData({ firstName: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="John"
            error={!vcardData.lastName && nameValidation.error ? nameValidation.error : undefined}
          />
          <Input
            label="Last Name"
            type="text"
            required
            value={vcardData.lastName}
            onChange={(e) => setVcardData({ lastName: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="Doe"
            error={!vcardData.firstName && nameValidation.error ? nameValidation.error : undefined}
          />
        </div>
      </fieldset>

      {/* Work Information */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
          Work Information
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Organization"
            type="text"
            value={vcardData.organization || ''}
            onChange={(e) => setVcardData({ organization: e.target.value })}
            placeholder="Company Inc."
          />
          <Input
            label="Job Title"
            type="text"
            value={vcardData.title || ''}
            onChange={(e) => setVcardData({ title: e.target.value })}
            placeholder="Manager"
          />
        </div>
      </fieldset>

      {/* Contact Details */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
          Contact Details
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            value={vcardData.phone || ''}
            onChange={(e) => setVcardData({ phone: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="+1 555 123 4567"
            error={phoneValidation.error}
          />
          <Input
            label="Email"
            type="email"
            value={vcardData.email || ''}
            onChange={(e) => setVcardData({ email: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="john@example.com"
            error={emailValidation.error}
          />
        </div>

        <Input
          label="Website"
          type="url"
          value={vcardData.website || ''}
          onChange={(e) => setVcardData({ website: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, website: true }))}
          placeholder="https://example.com"
          error={websiteValidation.error}
        />

        <Input
          label="Address"
          type="text"
          value={vcardData.address || ''}
          onChange={(e) => setVcardData({ address: e.target.value })}
          placeholder="123 Main St, City, Country"
        />
      </fieldset>

      {/* Additional */}
      <Textarea
        label="Notes"
        value={vcardData.note || ''}
        onChange={(e) => setVcardData({ note: e.target.value })}
        placeholder="Additional notes..."
        rows={2}
      />
    </div>
  );
}

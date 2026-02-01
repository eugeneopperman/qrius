import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { Phone } from 'lucide-react';
import { validatePhone } from '../../utils/validators';
import { useFormField } from '../../hooks/useFormField';

export function PhoneForm() {
  const { phoneData, setPhoneData } = useQRStore();
  const phoneField = useFormField(phoneData.phone, validatePhone);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Phone className="w-5 h-5" />
        <h3 className="font-medium">Phone Number</h3>
      </div>

      <Input
        label="Phone Number"
        type="tel"
        value={phoneData.phone}
        onChange={(e) => setPhoneData({ phone: e.target.value })}
        onBlur={phoneField.handleBlur}
        placeholder="+1 (555) 123-4567"
        hint={phoneField.isValid ? "Include country code for international numbers" : undefined}
        error={phoneField.error}
      />
    </div>
  );
}

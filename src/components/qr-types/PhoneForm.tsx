import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';

import { validatePhone } from '../../utils/validators';
import { useFormField } from '../../hooks/useFormField';

export function PhoneForm() {
  const { phoneData, setPhoneData } = useQRStore();
  const phoneField = useFormField(phoneData.phone, validatePhone);

  return (
    <div className="space-y-4">
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

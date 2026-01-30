import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { Phone } from 'lucide-react';

export function PhoneForm() {
  const { phoneData, setPhoneData } = useQRStore();

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
        placeholder="+1 (555) 123-4567"
        hint="Include country code for international numbers"
      />
    </div>
  );
}

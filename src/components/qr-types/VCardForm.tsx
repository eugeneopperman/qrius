import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { User } from 'lucide-react';

export function VCardForm() {
  const { vcardData, setVcardData } = useQRStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <User className="w-5 h-5" />
        <h3 className="font-medium">Contact Card (vCard)</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          type="text"
          value={vcardData.firstName}
          onChange={(e) => setVcardData({ firstName: e.target.value })}
          placeholder="John"
        />
        <Input
          label="Last Name"
          type="text"
          value={vcardData.lastName}
          onChange={(e) => setVcardData({ lastName: e.target.value })}
          placeholder="Doe"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Phone"
          type="tel"
          value={vcardData.phone || ''}
          onChange={(e) => setVcardData({ phone: e.target.value })}
          placeholder="+1 555 123 4567"
        />
        <Input
          label="Email"
          type="email"
          value={vcardData.email || ''}
          onChange={(e) => setVcardData({ email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>

      <Input
        label="Website"
        type="url"
        value={vcardData.website || ''}
        onChange={(e) => setVcardData({ website: e.target.value })}
        placeholder="https://example.com"
      />

      <Input
        label="Address"
        type="text"
        value={vcardData.address || ''}
        onChange={(e) => setVcardData({ address: e.target.value })}
        placeholder="123 Main St, City, Country"
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          value={vcardData.note || ''}
          onChange={(e) => setVcardData({ note: e.target.value })}
          placeholder="Additional notes..."
          rows={2}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none"
        />
      </div>
    </div>
  );
}

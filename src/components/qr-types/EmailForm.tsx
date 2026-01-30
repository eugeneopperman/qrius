import { useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { Mail } from 'lucide-react';
import { validateEmail } from '../../utils/validators';

export function EmailForm() {
  const { emailData, setEmailData } = useQRStore();
  const [touched, setTouched] = useState({ email: false });

  const emailValidation = touched.email ? validateEmail(emailData.email) : { isValid: true };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Mail className="w-5 h-5" />
        <h3 className="font-medium">Email</h3>
      </div>

      <Input
        label="Email Address"
        type="email"
        value={emailData.email}
        onChange={(e) => setEmailData({ email: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        placeholder="example@email.com"
        error={emailValidation.error}
      />

      <Input
        label="Subject (Optional)"
        type="text"
        value={emailData.subject || ''}
        onChange={(e) => setEmailData({ subject: e.target.value })}
        placeholder="Email subject"
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Body (Optional)
        </label>
        <textarea
          value={emailData.body || ''}
          onChange={(e) => setEmailData({ body: e.target.value })}
          placeholder="Email body text..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none"
        />
      </div>
    </div>
  );
}

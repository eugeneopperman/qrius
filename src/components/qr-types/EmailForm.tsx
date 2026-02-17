import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';

import { validateEmail } from '../../utils/validators';
import { useFormField } from '../../hooks/useFormField';

export function EmailForm() {
  const { emailData, setEmailData } = useQRStore();
  const emailField = useFormField(emailData.email, validateEmail);

  return (
    <div className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        value={emailData.email}
        onChange={(e) => setEmailData({ email: e.target.value })}
        onBlur={emailField.handleBlur}
        placeholder="example@email.com"
        error={emailField.error}
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

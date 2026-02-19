import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

import { validateEmail } from '@/utils/validators';
import { useFormField } from '@/hooks/useFormField';

export function EmailForm() {
  const { emailData, setEmailData } = useQRStore(useShallow((s) => ({ emailData: s.emailData, setEmailData: s.setEmailData })));
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

      <Textarea
        label="Body (Optional)"
        value={emailData.body || ''}
        onChange={(e) => setEmailData({ body: e.target.value })}
        placeholder="Email body text..."
        rows={3}
      />
    </div>
  );
}

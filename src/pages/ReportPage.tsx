import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const REASONS = [
  { value: 'phishing', label: 'Phishing — Attempts to steal credentials or personal info' },
  { value: 'malware', label: 'Malware — Links to malicious software or downloads' },
  { value: 'scam', label: 'Scam — Fraudulent offers or deceptive content' },
  { value: 'spam', label: 'Spam — Unsolicited or bulk promotional content' },
  { value: 'inappropriate', label: 'Inappropriate — Offensive or harmful content' },
  { value: 'copyright', label: 'Copyright — Unauthorized use of copyrighted material' },
  { value: 'other', label: 'Other' },
] as const;

export default function ReportPage() {
  const search = useSearch({ strict: false }) as { code?: string };
  const [shortCode, setShortCode] = useState(search?.code || '');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          short_code: shortCode.trim(),
          reason,
          description: description.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
      }

      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <LegalPageLayout title="Report Abuse" lastUpdated="">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Report Submitted
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Thank you for helping keep Qrius safe. Our team will review this report and take appropriate action.
          </p>
        </div>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout title="Report Abuse" lastUpdated="">
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        If you believe a QR code created with Qrius links to harmful, fraudulent, or inappropriate content,
        please let us know. We take all reports seriously and will investigate promptly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label htmlFor="short-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            QR Code Short Code <span className="text-red-500">*</span>
          </label>
          <input
            id="short-code"
            type="text"
            className="input w-full"
            placeholder="e.g., abc123"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            required
            maxLength={20}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            The code from the QR redirect URL (e.g., qrslnk.com/r/<strong>abc123</strong>)
          </p>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            className="input w-full"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          >
            <option value="">Select a reason...</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="input w-full min-h-[100px]"
            placeholder="Provide any additional details that may help our review..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Email (optional)
          </label>
          <input
            id="email"
            type="email"
            className="input w-full"
            placeholder="We'll notify you of the outcome"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !shortCode.trim() || !reason}
          className="btn btn-primary w-full sm:w-auto"
        >
          {status === 'loading' ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Report'
          )}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          For more information about what content is prohibited, see our{' '}
          <a href="/acceptable-use" className="text-orange-600 hover:text-orange-700 dark:text-orange-400">
            Acceptable Use Policy
          </a>.
        </p>
      </div>
    </LegalPageLayout>
  );
}

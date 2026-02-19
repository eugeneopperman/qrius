import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="February 5, 2026">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          1. Agreement to Terms
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          By accessing or using Qrius ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, you represent that you are at least 18 years of age or have the consent of a parent or guardian.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          2. Description of Service
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Qrius is a QR code generation and management platform that allows users to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Create customizable QR codes for various purposes (URLs, contact information, WiFi credentials, etc.)</li>
          <li>Track and analyze QR code scans</li>
          <li>Manage QR codes within teams and organizations</li>
          <li>Access QR code generation via API</li>
          <li>Store and manage brand templates</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          3. User Accounts
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          4. Acceptable Use
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You agree not to use the Service to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Create QR codes that link to illegal, harmful, or malicious content</li>
          <li>Distribute malware, viruses, or any other harmful code</li>
          <li>Engage in phishing, scams, or fraudulent activities</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Harass, abuse, or harm another person or group</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to the Service or related systems</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Use the Service for sending spam or unsolicited communications</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          We reserve the right to terminate or suspend your account and refuse any current or future use of the Service for violations of this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          5. Subscription Plans and Payment
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Qrius offers the following subscription plans:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
          <li><strong>Free:</strong> Limited features at no cost</li>
          <li><strong>Pro ($12/month):</strong> Enhanced features for individuals and small teams</li>
          <li><strong>Business ($39/month):</strong> Full features for larger teams and enterprises</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Paid subscriptions are billed in advance on a monthly basis. Your subscription will automatically renew at the end of each billing period unless you cancel it before the renewal date.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You may cancel your subscription at any time through your account settings. Upon cancellation, you will retain access to paid features until the end of your current billing period.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          We reserve the right to change our pricing with 30 days notice. Price changes will take effect at the start of your next billing period.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          6. Refund Policy
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We offer a 14-day money-back guarantee for new paid subscriptions. If you are not satisfied with the Service within the first 14 days of your paid subscription, you may request a full refund by contacting our support team.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Refunds are not available after the 14-day period or for subscription renewals. Partial refunds are not provided for unused portions of a subscription period.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          7. Intellectual Property
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Qrius and its licensors. The Service is protected by copyright, trademark, and other laws.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You retain ownership of any content you create using the Service, including QR codes and brand templates. By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to host and display your content solely for the purpose of providing the Service.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Qrius.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          8. API Usage
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Access to the Qrius API is subject to rate limits based on your subscription plan. You agree to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Keep your API keys confidential and secure</li>
          <li>Not share API keys with unauthorized parties</li>
          <li>Not attempt to circumvent rate limits or usage restrictions</li>
          <li>Comply with all applicable laws when using the API</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          We reserve the right to revoke API access for any user who violates these terms or engages in abusive behavior.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          9. Limitation of Liability
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          In no event shall Qrius, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          10. Disclaimer
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Qrius does not warrant that the Service will function uninterrupted, secure, or available at any particular time or location, or that any defects or errors will be corrected.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          11. Termination
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or delete your account through the settings page.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          12. Governing Law
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          13. Changes to Terms
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          14. Contact Us
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          <strong>Email:</strong> legal@qrius.app
        </p>
      </section>
    </LegalPageLayout>
  );
}

import { LegalPageLayout } from '../components/legal/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="February 5, 2026">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          1. Introduction
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Qrius ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our QR code generation service.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          2. Information We Collect
        </h2>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          2.1 Personal Information
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We may collect personal information that you voluntarily provide when you:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Create an account:</strong> Name, email address, password</li>
          <li><strong>Subscribe to a plan:</strong> Billing information, payment card details (processed securely by Stripe)</li>
          <li><strong>Create QR codes:</strong> URLs, contact information, WiFi credentials, or other content you choose to encode</li>
          <li><strong>Contact us:</strong> Email address, name, and any information you include in your message</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          2.2 Automatically Collected Information
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          When you access the Service, we automatically collect certain information:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
          <li><strong>IP Address:</strong> Used for security, analytics, and approximate geolocation</li>
          <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          2.3 QR Code Scan Data
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          When someone scans a QR code created with our Service, we collect:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Date and time of scan</li>
          <li>Approximate location (city/country level, derived from IP address)</li>
          <li>Device type and operating system</li>
          <li>Browser or scanning app used</li>
          <li>Referrer information (if available)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          This data is anonymized and used solely to provide analytics to QR code owners.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          3. How We Use Your Information
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Provide, maintain, and improve the Service</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and customer service requests</li>
          <li>Provide QR code scan analytics and reports</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
          <li>Personalize and improve your experience</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          4. Information Sharing
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (e.g., payment processing, hosting, analytics)</li>
          <li><strong>Team Members:</strong> Within your organization, with other team members you have invited</li>
          <li><strong>Legal Requirements:</strong> If required by law or in response to valid legal process</li>
          <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property, or that of our users or the public</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          5. Third-Party Services
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We use the following third-party services that may collect information:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Supabase:</strong> Authentication and database hosting</li>
          <li><strong>Stripe:</strong> Payment processing</li>
          <li><strong>Vercel:</strong> Website hosting and analytics</li>
          <li><strong>Google:</strong> OAuth authentication (if you sign in with Google)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Each of these services has their own privacy policy governing their use of your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          6. Data Retention
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We retain your information for as long as your account is active or as needed to provide you services. Specifically:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Account Data:</strong> Retained until you delete your account</li>
          <li><strong>QR Code Data:</strong> Retained until you delete the QR code or your account</li>
          <li><strong>Scan Analytics:</strong> Retained based on your plan (30 days for Free, 1 year for Pro, 2 years for Business)</li>
          <li><strong>Payment Records:</strong> Retained for 7 years for tax and legal compliance</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          After account deletion, we may retain certain information as required by law or for legitimate business purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          7. Your Rights (GDPR)
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you are located in the European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR):
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
          <li><strong>Erasure:</strong> Request deletion of your personal data</li>
          <li><strong>Portability:</strong> Request your data in a portable format</li>
          <li><strong>Restriction:</strong> Request restriction of processing</li>
          <li><strong>Objection:</strong> Object to certain types of processing</li>
          <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          To exercise these rights, please visit your account settings or contact us at privacy@qrius.app. We will respond to your request within 30 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          8. Data Security
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We implement appropriate technical and organizational measures to protect your personal information, including:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Encryption of data in transit (TLS/SSL)</li>
          <li>Encryption of sensitive data at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
          <li>Secure password hashing</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          9. International Data Transfers
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          10. Children's Privacy
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          11. Changes to This Policy
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          You are advised to review this Privacy Policy periodically for any changes. Changes are effective when they are posted on this page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          12. Contact Us
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you have any questions about this Privacy Policy or our privacy practices, please contact us:
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Email:</strong> privacy@qrius.app
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          <strong>Data Protection Officer:</strong> dpo@qrius.app
        </p>
      </section>
    </LegalPageLayout>
  );
}

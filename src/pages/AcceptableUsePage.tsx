import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout title="Acceptable Use Policy" lastUpdated="March 4, 2026">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          1. Purpose
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          This Acceptable Use Policy ("AUP") outlines the rules and guidelines for using Qrius QR code
          generation and management services. By using Qrius, you agree to comply with this policy. We
          reserve the right to suspend or terminate access for any user who violates these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          2. Prohibited Content
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You may not use Qrius to create QR codes that link to, distribute, or promote:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Phishing:</strong> Pages designed to steal credentials, personal information, or financial data by impersonating legitimate services.</li>
          <li><strong>Malware:</strong> Software or downloads intended to damage, disrupt, or gain unauthorized access to devices or systems.</li>
          <li><strong>Scams:</strong> Fraudulent schemes including fake lotteries, prize scams, advance-fee fraud, or deceptive investment opportunities.</li>
          <li><strong>Spam:</strong> Unsolicited bulk content, chain messages, or excessive promotional material.</li>
          <li><strong>Illegal content:</strong> Material that violates applicable laws, including but not limited to content related to illegal drugs, weapons, or human trafficking.</li>
          <li><strong>Hate speech:</strong> Content that promotes violence, discrimination, or hostility against individuals or groups based on protected characteristics.</li>
          <li><strong>Child exploitation:</strong> Any content that exploits or endangers minors.</li>
          <li><strong>Copyright infringement:</strong> Unauthorized distribution of copyrighted material.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          3. Prohibited Activities
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You may not:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>Use Qrius to circumvent security measures, authentication systems, or access controls.</li>
          <li>Create QR codes that redirect through chains of obfuscation to hide the final destination.</li>
          <li>Abuse the platform's infrastructure through automated mass creation of QR codes for spam distribution.</li>
          <li>Impersonate other organizations or individuals through QR codes.</li>
          <li>Use QR codes to collect personal data without proper consent or in violation of privacy laws.</li>
          <li>Resell or redistribute Qrius services without authorization.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          4. Enforcement
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          When we identify or receive reports of policy violations, we may take one or more of the following actions:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Warning:</strong> We may issue a warning and request that you remove or modify the offending content.</li>
          <li><strong>QR Code Suspension:</strong> The specific QR code may be deactivated, preventing it from redirecting to the destination URL. Scans will show a violation notice instead.</li>
          <li><strong>Account Suspension:</strong> Your account may be temporarily or permanently suspended, preventing access to all QR codes and services.</li>
          <li><strong>Content Removal:</strong> We may remove QR codes and associated data that violate this policy.</li>
          <li><strong>Law Enforcement Referral:</strong> In cases involving illegal activity, we may report the matter to appropriate law enforcement authorities.</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          The severity of enforcement action depends on the nature and impact of the violation, whether it
          is a first or repeat offense, and the intent behind the violation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          5. Reporting Abuse
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you encounter a QR code created with Qrius that you believe violates this policy, please report
          it through our{' '}
          <a href="/report" className="text-orange-600 hover:text-orange-700 dark:text-orange-400">
            abuse report form
          </a>. When submitting a report, please include:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>The QR code short code or redirect URL</li>
          <li>The reason for your report</li>
          <li>Any relevant details about the harmful content</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          We review all reports within 48 hours and will take appropriate action based on our findings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          6. Appeals
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          If you believe your QR code was incorrectly suspended or your account was unfairly restricted,
          you may submit an appeal by contacting us at{' '}
          <a href="mailto:support@qriuscodes.com" className="text-orange-600 hover:text-orange-700 dark:text-orange-400">
            support@qriuscodes.com
          </a>.
          Please include your account email, the affected QR code(s), and an explanation of why you believe the
          action was taken in error. We will review appeals within 5 business days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          7. Changes to This Policy
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We may update this Acceptable Use Policy from time to time. Material changes will be communicated
          through the Qrius platform or via email. Continued use of the service after changes take effect
          constitutes acceptance of the updated policy.
        </p>
      </section>
    </LegalPageLayout>
  );
}

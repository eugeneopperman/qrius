import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="February 5, 2026">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          1. What Are Cookies?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how their site is being used.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          This Cookie Policy explains what cookies we use, why we use them, and how you can control them.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          2. Types of Cookies We Use
        </h2>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          2.1 Essential Cookies
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and accessibility. You cannot disable these cookies.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600 dark:text-gray-300 mb-4">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-medium">Cookie Name</th>
                <th className="text-left py-2 pr-4 font-medium">Purpose</th>
                <th className="text-left py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs">sb-*-auth-token</td>
                <td className="py-2 pr-4">Authentication session</td>
                <td className="py-2">Session</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs">qr-generator-*</td>
                <td className="py-2 pr-4">App preferences and state</td>
                <td className="py-2">Persistent</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          2.2 Preference Cookies
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          These cookies remember your preferences and settings to enhance your experience.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600 dark:text-gray-300 mb-4">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-medium">Cookie Name</th>
                <th className="text-left py-2 pr-4 font-medium">Purpose</th>
                <th className="text-left py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs">qr-generator-theme</td>
                <td className="py-2 pr-4">Dark/light mode preference</td>
                <td className="py-2">1 year</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs">qr-generator-language</td>
                <td className="py-2 pr-4">Language preference</td>
                <td className="py-2">1 year</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                <td className="py-2 pr-4">Your cookie consent choice</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          2.3 Analytics Cookies
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. You can opt out of these cookies.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600 dark:text-gray-300 mb-4">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-medium">Cookie Name</th>
                <th className="text-left py-2 pr-4 font-medium">Purpose</th>
                <th className="text-left py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs">_va</td>
                <td className="py-2 pr-4">Vercel Analytics visitor ID</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          3. Local Storage
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          In addition to cookies, we use local storage to store certain data on your device:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>QR Code History:</strong> Your recent QR codes for quick access</li>
          <li><strong>Brand Templates:</strong> Your saved style templates</li>
          <li><strong>App Settings:</strong> UI preferences and settings</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          This data is stored locally on your device and is not transmitted to our servers unless you are logged in and choose to sync your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          4. Third-Party Cookies
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Some cookies on our site are set by third-party services that appear on our pages:
        </p>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          Stripe (Payment Processing)
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          When you make a payment, Stripe may set cookies to prevent fraud and process your payment securely. See{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500">
            Stripe's Privacy Policy
          </a>.
        </p>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          Google (OAuth Authentication)
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you sign in with Google, Google may set cookies for authentication purposes. See{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500">
            Google's Privacy Policy
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          5. Managing Cookies
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You can control and manage cookies in several ways:
        </p>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          5.1 Cookie Consent Banner
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          When you first visit our site, you'll see a cookie consent banner where you can choose to accept or decline non-essential cookies. You can change your preferences at any time by clicking "Cookie Settings" in the footer.
        </p>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          5.2 Browser Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>View cookies stored on your device</li>
          <li>Delete all or specific cookies</li>
          <li>Block cookies from specific sites</li>
          <li>Block all cookies (note: this may affect website functionality)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Here's how to manage cookies in popular browsers:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mt-2">
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500">
              Microsoft Edge
            </a>
          </li>
        </ul>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
          5.3 Clearing Local Storage
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          To clear local storage data, you can use your browser's developer tools or clear your browser's site data. Note that this will also clear your QR code history and saved templates.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          6. Impact of Disabling Cookies
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you disable cookies, some features of the Service may not work properly:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
          <li>You may need to log in every time you visit</li>
          <li>Your preferences (theme, language) may not be saved</li>
          <li>Some features requiring authentication may not work</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Essential cookies cannot be disabled as they are required for the basic functionality of the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          7. Updates to This Policy
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          8. Contact Us
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you have any questions about our use of cookies, please contact us:
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Email:</strong> privacy@qrius.app
        </p>
      </section>
    </LegalPageLayout>
  );
}

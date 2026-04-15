import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms & Conditions - Acaedu' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 prose prose-gray max-w-none">
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Acaedu (&quot;the Platform&quot;), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform.</p>

          <h2>2. Description of Service</h2>
          <p>Acaedu is a Smart Academic Notification &amp; Scheduling System designed to streamline communication between students, lecturers, and administrators within an academic environment. The Platform provides:</p>
          <ul>
            <li>Real-time class notifications and schedule management</li>
            <li>Course enrollment and academic tracking</li>
            <li>Announcement and event management</li>
            <li>Grade and attendance tracking</li>
            <li>Lecture video hosting and AI summarization</li>
            <li>Billing and subscription management</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>Users must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. Unauthorized use of your account must be reported immediately.</p>

          <h2>4. User Roles</h2>
          <p>The Platform supports three primary roles: Students, Lecturers, and Administrators. Each role has specific permissions and access levels as determined by the institution.</p>

          <h2>5. Acceptable Use</h2>
          <p>Users agree not to:</p>
          <ul>
            <li>Upload malicious content or attempt to compromise system security</li>
            <li>Share account credentials with unauthorized parties</li>
            <li>Use the Platform for purposes unrelated to academic activities</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2>6. Payment Terms</h2>
          <p>Subscription fees are billed according to the selected plan (monthly or yearly). Payments are processed through Paystack or PayPal. Refunds are subject to the institutional refund policy.</p>

          <h2>7. Intellectual Property</h2>
          <p>All content, features, and functionality of the Platform are owned by Acaedu and protected by intellectual property laws. Course materials uploaded by lecturers remain the property of the respective content creators.</p>

          <h2>8. Data Privacy</h2>
          <p>Your use of the Platform is also governed by our Privacy Policy. Please review the Privacy Policy for information on how we collect, use, and protect your data.</p>

          <h2>9. Limitation of Liability</h2>
          <p>Acaedu shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Platform. The Platform is provided &quot;as is&quot; without warranties of any kind.</p>

          <h2>10. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or in-app notification.</p>

          <h2>11. Contact</h2>
          <p>For questions about these terms, please contact us at <a href="mailto:support@acadion.com">support@acadion.com</a>.</p>
        </div>
      </div>
    </div>
  );
}

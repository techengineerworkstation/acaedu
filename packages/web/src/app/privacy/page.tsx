import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy - Acaedu' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 prose prose-gray max-w-none">
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email, phone number, student/employee ID, matriculation number, date of birth, gender, profile photo</li>
            <li><strong>Academic Information:</strong> Course enrollments, grades, attendance records, schedule data</li>
            <li><strong>Usage Data:</strong> Login activity, search queries, notification interactions, feature usage</li>
            <li><strong>Payment Information:</strong> Billing details processed through Paystack/PayPal (we do not store full payment card details)</li>
            <li><strong>Device Information:</strong> Device type, operating system, push notification tokens</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Providing and maintaining the Platform services</li>
            <li>Sending academic notifications, reminders, and announcements</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Generating AI-powered lecture summaries and schedule suggestions</li>
            <li>Improving Platform functionality and user experience</li>
            <li>Communicating with CRM platforms (HubSpot, Salesforce, Zendesk) for institutional management</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>We share data with:</p>
          <ul>
            <li><strong>Your Institution:</strong> Academic data is shared with authorized administrators and lecturers</li>
            <li><strong>Payment Processors:</strong> Paystack and PayPal for transaction processing</li>
            <li><strong>Email Services:</strong> Resend for transactional email delivery</li>
            <li><strong>CRM Platforms:</strong> As configured by institution administrators</li>
            <li><strong>AI Services:</strong> For lecture summarization and translation (anonymized content only)</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures including:</p>
          <ul>
            <li>Row Level Security (RLS) on all database tables</li>
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Firebase Authentication with multi-factor support</li>
            <li>Role-based access control</li>
            <li>Regular security audits</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>We retain your data for the duration of your account and for a reasonable period thereafter for legal and operational purposes. Academic records may be retained longer as required by institutional policies.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account</li>
            <li>Opt out of non-essential communications</li>
            <li>Export your data in a portable format</li>
          </ul>

          <h2>7. Cookies and Tracking</h2>
          <p>We use essential cookies for authentication and session management. Analytics cookies may be used to improve the Platform experience.</p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>The Platform is designed for use by educational institutions and their members. We do not knowingly collect data from children under 13 without parental consent.</p>

          <h2>9. Contact Us</h2>
          <p>For privacy-related inquiries: <a href="mailto:privacy@acadion.com">privacy@acadion.com</a></p>
        </div>
      </div>
    </div>
  );
}

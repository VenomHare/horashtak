import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Introduction</h2>
              <p className="text-gray-700">
                This Privacy Policy describes how we collect, use, and protect your information when you use our APK distribution service. We are committed to protecting your privacy and ensuring the security of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Authentication Information:</strong> When you sign in with Google OAuth, we collect your email address and name provided by Google for user identification and account management purposes.</p>
                <p><strong>Download Information:</strong> We track download events including IP address, user agent, download timestamp, and which release was downloaded for analytics and security purposes.</p>
                <p><strong>Account Information:</strong> We maintain your approval status, admin privileges, and last download timestamp for service functionality.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Authentication:</strong> To verify your identity and provide access to the service.</p>
                <p><strong>Access Control:</strong> To determine if you are authorized to download APK files.</p>
                <p><strong>Analytics:</strong> To track download statistics and improve our service.</p>
                <p><strong>Security:</strong> To prevent abuse and ensure secure distribution of APK files.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Storage and Security</h2>
              <p className="text-gray-700">
                Your data is stored securely using Supabase (built on PostgreSQL) and protected by Row-Level Security policies. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
              <p className="text-gray-700">
                We retain your account information for as long as your account is active. Download analytics are retained for business purposes. You may request deletion of your account and associated data by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Google OAuth:</strong> We use Google OAuth for authentication. Google's privacy policy governs the use of your information by Google.</p>
                <p><strong>Supabase:</strong> We use Supabase for database and authentication services. Your data is stored in accordance with Supabase's privacy practices.</p>
                <p><strong>Cloudflare R2:</strong> APK files are stored in Cloudflare R2. Download links are temporary and expire after 10 minutes.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-gray-700">
                You have the right to access, correct, or delete your personal information. You may also opt out of certain data collection. To exercise these rights, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our data practices, please contact us through the application's contact channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

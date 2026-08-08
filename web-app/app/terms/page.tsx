import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing or using our APK distribution service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
              <p className="text-gray-700">
                Our service provides secure distribution of Android APK files to authorized users. The service includes user authentication via Google OAuth, file download management, and administrative controls for release management.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Registration:</strong> You must sign in using Google OAuth to access the service. You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p><strong>Authorization:</strong> Access to APK downloads is restricted to approved users only. Admins reserve the right to approve or deny access requests at their discretion.</p>
                <p><strong>Account Termination:</strong> We reserve the right to suspend or terminate your account for violation of these terms or abusive behavior.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
              <div className="space-y-3 text-gray-700">
                <p>You agree to use the service only for its intended purposes and in accordance with these terms. Prohibited activities include:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Attempting to bypass access controls or download files without authorization</li>
                  <li>Sharing download links or credentials with unauthorized individuals</li>
                  <li>Reverse engineering, decompiling, or attempting to extract source code from distributed APKs</li>
                  <li>Using automated tools to scrape or abuse the service</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>APK Files:</strong> The APK files distributed through this service are the intellectual property of the application developers. You may not modify, redistribute, or create derivative works without explicit permission.</p>
                <p><strong>Service Content:</strong> The service design, functionality, and content are protected by intellectual property laws.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                The service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free. We are not responsible for any issues arising from the use of distributed APK files.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to damages for loss of data, profit, or business interruption.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Privacy</h2>
              <p className="text-gray-700">
                Your use of the service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. Please review our Privacy Policy for more details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Modifications to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Continued use of the service after modifications constitutes acceptance of the updated terms. We will notify users of material changes through the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us through the application's contact channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

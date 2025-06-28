import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                  <p>When you rent items from My Green Loop, we collect:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Full name and contact information (email address, phone number)</li>
                    <li>Rental preferences and delivery information</li>
                    <li>Order history and rental dates</li>
                    <li>Communication records for customer service</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Website usage patterns and analytics</li>
                    <li>Session information and preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="text-gray-700">
                <p className="mb-3">We use your personal information to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Process and fulfill your rental orders</li>
                  <li>Send order confirmations, updates, and delivery notifications via SMS and email</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Improve our services and develop new features</li>
                  <li>Send promotional messages about our eco-friendly rental services (with your consent)</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. SMS Messaging and Communications</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  <strong>SMS Notifications:</strong> By providing your phone number, you consent to receive SMS messages from My Green Loop including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Order confirmations and rental receipts</li>
                  <li>Delivery and pickup notifications</li>
                  <li>Rental reminders and return notices</li>
                  <li>Customer service communications</li>
                </ul>
                <p>
                  <strong>Opt-Out:</strong> You can stop SMS messages at any time by replying "STOP" to any message. Message and data rates may apply.
                </p>
                <p>
                  <strong>Frequency:</strong> Message frequency varies based on your rental activity. You will receive messages related to active orders and may receive promotional messages if you opt in.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <div className="text-gray-700 space-y-3">
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Service Providers:</strong> Third-party vendors who help us operate our business (SMS providers, email services, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Safety and Security:</strong> To protect our rights, property, or safety of our users</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security and Retention</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  We retain your personal information for as long as necessary to provide our services, comply with legal obligations, and resolve disputes. Rental history may be kept for business records and customer service purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <div className="text-gray-700 space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your personal data (subject to legal requirements)</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request information about how we use your data</li>
                  <li>File a complaint with relevant data protection authorities</li>
                </ul>
                <p>
                  To exercise these rights, contact us at the information provided below.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Our website may contain links to third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>
                <p>
                  <strong>SMS Service Provider:</strong> We use Twilio for SMS communications. Their privacy policy can be found at https://www.twilio.com/legal/privacy
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <div className="text-gray-700">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <div className="text-gray-700">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <div className="text-gray-700 space-y-2">
                <p>If you have questions about this privacy policy or our privacy practices, please contact us:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>My Green Loop</strong></p>
                  <p>Email: privacy@mygreenloop.com</p>
                  <p>Phone: +1 (555) 123-4567</p>
                  <p>Address: 123 Eco Street, Green City, GC 12345</p>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Compliance Statements</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  <strong>TCPA Compliance:</strong> We comply with the Telephone Consumer Protection Act (TCPA). By providing your phone number, you expressly consent to receive automated SMS messages from My Green Loop regarding your orders and our services.
                </p>
                <p>
                  <strong>CAN-SPAM Compliance:</strong> Our email communications comply with the CAN-SPAM Act. You can unsubscribe from marketing emails at any time using the link provided in each email.
                </p>
                <p>
                  <strong>GDPR Compliance:</strong> For users in the European Union, we comply with the General Data Protection Regulation (GDPR) regarding data protection and privacy rights.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
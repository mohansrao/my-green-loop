import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-700">
                <p>
                  By accessing and using My Green Loop's rental services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  My Green Loop provides eco-friendly dining item rental services including plates, glasses, cutlery, and related tableware for events and gatherings.
                </p>
                <p>
                  Our services include online ordering, delivery coordination, and SMS/email notifications to enhance your rental experience.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. SMS Communications Consent</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  By providing your mobile phone number and using our services, you expressly consent to receive automated text messages from My Green Loop, including:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Order confirmations and rental receipts</li>
                  <li>Delivery and pickup notifications</li>
                  <li>Rental reminders and return notices</li>
                  <li>Customer service communications</li>
                  <li>Promotional messages (if you opt in)</li>
                </ul>
                <p>
                  <strong>Opt-Out:</strong> You may opt out of SMS messages at any time by texting "STOP" to any message from us. Message and data rates may apply.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Rental Terms and Conditions</h2>
              <div className="text-gray-700 space-y-3">
                <p><strong>Rental Period:</strong> All items must be returned by the agreed return date. Late returns may incur additional fees.</p>
                <p><strong>Condition of Items:</strong> Customers are responsible for returning items in the same condition as received, normal wear excepted.</p>
                <p><strong>Damage and Loss:</strong> Customers will be charged replacement costs for lost or significantly damaged items.</p>
                <p><strong>Cancellation:</strong> Orders may be cancelled up to 24 hours before the delivery date for a full refund.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
              <div className="text-gray-700">
                <p>Users agree to:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Provide accurate and complete information when placing orders</li>
                  <li>Use rental items only for their intended purpose</li>
                  <li>Handle items with reasonable care</li>
                  <li>Return items clean and in good condition</li>
                  <li>Pay all fees and charges in a timely manner</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment and Pricing</h2>
              <div className="text-gray-700 space-y-3">
                <p>All rental fees must be paid at the time of booking unless other arrangements are made.</p>
                <p>Prices are subject to change without notice. Additional fees may apply for delivery, late returns, or damaged items.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  My Green Loop's liability is limited to the rental fees paid for the specific order. We are not liable for any indirect, incidental, or consequential damages.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <div className="text-gray-700">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information, including your consent to SMS communications.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications to Terms</h2>
              <div className="text-gray-700">
                <p>
                  We reserve the right to modify these terms at any time. Changes will be posted on our website with an updated effective date. Continued use of our services constitutes acceptance of the modified terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <div className="text-gray-700 space-y-2">
                <p>For questions about these Terms of Service, please contact us:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>My Green Loop</strong></p>
                  <p>Email: wolfetechnologies8@gmail.com</p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
    </div>
  );
}
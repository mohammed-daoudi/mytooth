import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - My Tooth',
  description: 'Terms of Service for My Tooth Dental Clinic',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By using My Tooth dental services, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Services</h2>
            <p className="text-gray-700 leading-relaxed">
              My Tooth provides professional dental care services including general dentistry, cosmetic procedures, and orthodontics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Appointments</h2>
            <p className="text-gray-700 leading-relaxed">
              Appointments must be cancelled at least 24 hours in advance. Late cancellations may be subject to charges.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy for information about how we collect and use your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these terms, please contact us at info@mytooth.com or (555) 123-TOOTH.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

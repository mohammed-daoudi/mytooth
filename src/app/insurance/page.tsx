import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insurance & Financing - My Tooth',
  description: 'Insurance and financing options at My Tooth Dental Clinic',
};

export default function InsurancePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Insurance & Financing</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accepted Insurance Plans</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We accept most major dental insurance plans including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Delta Dental</li>
              <li>Cigna Dental</li>
              <li>MetLife</li>
              <li>Aetna</li>
              <li>Blue Cross Blue Shield</li>
              <li>Humana</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Financing Options</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer flexible payment options to make dental care accessible:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>CareCredit financing</li>
              <li>Monthly payment plans</li>
              <li>Cash discounts</li>
              <li>HSA/FSA accepted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Insurance Verification</h2>
            <p className="text-gray-700 leading-relaxed">
              Our staff will help verify your insurance benefits before your appointment. Please bring your insurance card and a valid ID to your visit.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Financing Options - My Tooth',
  description: 'Affordable financing options for dental care at My Tooth',
};

export default function FinancingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Financing Options</h1>

        <p className="text-xl text-gray-600 mb-8">
          Don't let cost prevent you from getting the dental care you need. We offer several financing options to make treatment affordable.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">CareCredit</h3>
            <p className="text-gray-700 mb-4">
              Interest-free payment plans available for qualified patients. Apply in minutes!
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>6, 12, or 18-month plans</li>
              <li>No interest if paid in full</li>
              <li>Quick approval process</li>
            </ul>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">In-House Payment Plans</h3>
            <p className="text-gray-700 mb-4">
              Custom payment arrangements tailored to your budget and treatment needs.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Flexible monthly payments</li>
              <li>No credit check required</li>
              <li>Personalized terms</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-cyan-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h2>
          <p className="text-gray-700 mb-4">
            Our financial coordinators are here to help you find the best payment option for your situation.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Contact Us Today
          </Link>
        </div>
      </div>
    </div>
  );
}

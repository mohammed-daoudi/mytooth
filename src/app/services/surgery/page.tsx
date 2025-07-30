import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Oral Surgery - My Tooth',
  description: 'Professional oral surgery services at My Tooth Dental Clinic',
};

export default function OralSurgeryPage() {
  const procedures = [
    {
      name: "Tooth Extractions",
      description: "Safe and comfortable removal of damaged or problematic teeth"
    },
    {
      name: "Wisdom Teeth Removal",
      description: "Expert extraction of impacted or problematic wisdom teeth"
    },
    {
      name: "Dental Implants",
      description: "Permanent tooth replacement solutions with natural-looking results"
    },
    {
      name: "Bone Grafting",
      description: "Procedures to restore bone structure for implant placement"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oral Surgery</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our skilled oral surgeons provide advanced surgical treatments in a comfortable, safe environment using the latest techniques and technology.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {procedures.map((procedure, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{procedure.name}</h3>
              <p className="text-gray-700 leading-relaxed">{procedure.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-cyan-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Oral Surgery?</h2>
          <p className="text-gray-700 mb-6">
            Our experienced team is here to provide safe, effective oral surgery treatments with your comfort as our priority.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            Schedule Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

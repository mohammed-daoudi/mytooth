import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Forms - My Tooth',
  description: 'Download and complete patient forms for My Tooth Dental Clinic',
};

export default function PatientFormsPage() {
  const forms = [
    {
      name: "New Patient Registration",
      description: "Complete your registration before your first visit",
      downloadable: true
    },
    {
      name: "Medical History Form",
      description: "Provide your medical history for safe treatment",
      downloadable: true
    },
    {
      name: "Insurance Information",
      description: "Submit your insurance details for billing",
      downloadable: true
    },
    {
      name: "Consent Forms",
      description: "Treatment consent and authorization forms",
      downloadable: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Patient Forms</h1>

        <p className="text-xl text-gray-600 mb-8">
          To help streamline your visit, please complete these forms before your appointment.
        </p>

        <div className="space-y-6">
          {forms.map((form, index) => (
            <div key={index} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.name}</h3>
                <p className="text-gray-600">{form.description}</p>
              </div>
              <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
                Download PDF
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h2>
          <p className="text-gray-700 mb-4">
            If you have trouble accessing or completing any forms, our staff is happy to assist you.
          </p>
          <p className="text-blue-600 font-medium">
            Call us at (555) 123-TOOTH or arrive 15 minutes early to complete forms in our office.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers - My Tooth',
  description: 'Join the My Tooth Dental Clinic team',
};

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Join Our Team</h1>

        <p className="text-xl text-gray-600 mb-8">
          We're always looking for passionate dental professionals to join our growing practice.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Work With Us?</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Competitive salary and benefits package</li>
              <li>State-of-the-art equipment and technology</li>
              <li>Continuing education opportunities</li>
              <li>Collaborative and supportive work environment</li>
              <li>Professional development and growth opportunities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Openings</h2>
            <p className="text-gray-700 mb-4">
              We are currently accepting applications for the following positions:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Dental Hygienist (Full-time)</li>
              <li>Dental Assistant (Part-time)</li>
              <li>Front Desk Coordinator (Full-time)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-gray-700 mb-4">
              Send your resume and cover letter to careers@mytooth.com or drop by our office during business hours.
            </p>
            <div className="p-6 bg-cyan-50 rounded-lg">
              <p className="text-cyan-800 font-medium">
                Email: careers@mytooth.com<br />
                Phone: (555) 123-TOOTH<br />
                Address: 123 Dental Street, Health City, HC 12345
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

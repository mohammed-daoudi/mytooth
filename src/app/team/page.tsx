import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team - My Tooth',
  description: 'Meet the professional dental team at My Tooth Dental Clinic',
};

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Smith",
      role: "Lead Dentist",
      specialization: "General Dentistry & Cosmetics",
      description: "Dr. Smith has over 15 years of experience providing comprehensive dental care."
    },
    {
      name: "Dr. Michael Johnson",
      role: "Orthodontist",
      specialization: "Orthodontics & Braces",
      description: "Specializing in creating beautiful, straight smiles for patients of all ages."
    },
    {
      name: "Lisa Chen",
      role: "Dental Hygienist",
      specialization: "Preventive Care",
      description: "Dedicated to helping patients maintain optimal oral health through preventive care."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our experienced dental professionals are committed to providing you with the highest quality care in a comfortable, welcoming environment.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-32 h-32 bg-cyan-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-semibold text-cyan-600">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-cyan-600 font-medium mb-2">{member.role}</p>
            <p className="text-sm text-gray-600 mb-3">{member.specialization}</p>
            <p className="text-gray-700 text-sm leading-relaxed">{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

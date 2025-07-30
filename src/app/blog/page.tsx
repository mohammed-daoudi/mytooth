import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dental Blog - My Tooth',
  description: 'Dental health tips and insights from My Tooth Dental Clinic',
};

export default function BlogPage() {
  const posts = [
    {
      title: "5 Tips for Better Oral Hygiene",
      excerpt: "Learn simple daily habits that can dramatically improve your dental health.",
      date: "January 15, 2025"
    },
    {
      title: "Understanding Cosmetic Dentistry Options",
      excerpt: "Explore the various treatments available to enhance your smile.",
      date: "January 10, 2025"
    },
    {
      title: "The Importance of Regular Dental Checkups",
      excerpt: "Why preventive care is the key to maintaining healthy teeth and gums.",
      date: "January 5, 2025"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dental Health Blog</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Stay informed about dental health with expert tips and insights from our team.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {posts.map((post, index) => (
          <article key={index} className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="text-sm text-cyan-600 mb-2">{post.date}</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{post.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{post.excerpt}</p>
            <button className="text-cyan-600 hover:text-cyan-700 font-medium">
              Read More →
            </button>
          </article>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600">More articles coming soon!</p>
      </div>
    </div>
  );
}

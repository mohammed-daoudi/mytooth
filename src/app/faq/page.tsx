import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - My Tooth',
  description: 'Frequently Asked Questions about My Tooth Dental Clinic',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "What insurance do you accept?",
      answer: "We accept most major dental insurance plans. Please contact our office to verify your specific coverage."
    },
    {
      question: "Do you offer emergency dental care?",
      answer: "Yes, we provide emergency dental services. Please call our office immediately for urgent dental needs."
    },
    {
      question: "How often should I visit the dentist?",
      answer: "We recommend regular check-ups every 6 months for optimal oral health."
    },
    {
      question: "Do you offer payment plans?",
      answer: "Yes, we offer flexible payment plans and financing options to make dental care affordable."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-cyan-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Still have questions?</h2>
          <p className="text-gray-700 mb-4">
            Don't hesitate to contact us. Our friendly staff is here to help!
          </p>
          <p className="text-cyan-600 font-medium">
            Call us at (555) 123-TOOTH or email info@mytooth.com
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Truck,
  CreditCard,
  Clock,
  Shield,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react';

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Ordering & Shopping',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Simply browse our products, add items to your cart, and proceed to checkout. You can sign up for a free account to save your preferences and delivery address.',
        },
        {
          q: 'Can I modify my order after placing it?',
          a: 'Orders can be modified within 30 minutes of placement. Contact our support team immediately if you need to make changes.',
        },
        {
          q: 'Do you offer same-day delivery?',
          a: 'Yes! We offer same-day delivery for orders placed before 2 PM in eligible areas. Express delivery (30 minutes) is available in select zones.',
        },
        {
          q: 'What if an item is out of stock?',
          a: 'If an item is unavailable, our team will contact you for a suitable replacement or refund. You can also set preferences for substitutions.',
        },
      ],
    },
    {
      title: 'Delivery & Shipping',
      icon: <Truck className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      questions: [
        {
          q: 'What are your delivery hours?',
          a: 'We deliver Monday through Sunday from 8 AM to 10 PM. Same-day delivery is available for orders placed before 2 PM.',
        },
        {
          q: 'How much does delivery cost?',
          a: 'Delivery is FREE on orders over $50. Orders under $50 have a $4.99 delivery fee. Express delivery (30 minutes) is $9.99.',
        },
        {
          q: 'Do you deliver to my area?',
          a: 'We currently serve major metropolitan areas. Enter your zip code at checkout to check eligibility and see delivery options.',
        },
        {
          q: 'Can I schedule delivery for a specific time?',
          a: 'Yes! Choose from multiple time slots including morning (8 AM - 12 PM), afternoon (12 PM - 5 PM), and evening (5 PM - 10 PM).',
        },
      ],
    },
    {
      title: 'Payment & Refunds',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept credit/debit cards (Visa, MasterCard, American Express), digital wallets (Apple Pay, Google Pay), and cash on delivery.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, we use industry-standard SSL encryption and PCI-compliant payment processing to ensure your information is secure.',
        },
        {
          q: 'What is your refund policy?',
          a: 'We offer full refunds for damaged or incorrect items. Refunds are processed within 3-5 business days to your original payment method.',
        },
        {
          q: 'Can I get a refund for changed orders?',
          a: "If you cancel an order before it ships, you'll receive a full refund. Once delivery begins, refunds are processed based on the items returned.",
        },
      ],
    },
    {
      title: 'Quality & Safety',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      questions: [
        {
          q: 'How do you ensure food quality?',
          a: 'We partner with certified suppliers and conduct regular quality checks. All products are stored and transported in temperature-controlled conditions.',
        },
        {
          q: 'What safety measures do you have in place?',
          a: 'Our delivery team follows strict hygiene protocols, including masks, gloves, and sanitization. We also offer contactless delivery options.',
        },
        {
          q: 'Are your products organic?',
          a: 'We offer a wide range of organic products clearly labeled. Non-organic items are sourced from trusted, quality suppliers.',
        },
        {
          q: 'How do you handle allergies?',
          a: 'Allergen information is clearly marked on product pages. Our team can help identify allergen-free options when you call for assistance.',
        },
      ],
    },
  ];

  return (
    <PageLayout>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about ordering, delivery, payments,
            and more.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <span className={category.color}>{category.icon}</span>
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Card className="mx-auto border shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-gray-600 mb-6">
                Our customer support team is here to help you with any questions
                or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shrink-0"
                >
                  <MessageSquare className="w-5 h-5" />
                  Contact Support
                </Link>
                <a
                  href="tel:+1-800-FRESH-MART"
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors shrink-0"
                >
                  <Phone className="w-5 h-5" />
                  Call Us: 1-800-FRESH-MART
                </a>
                <a
                  href="mailto:support@freshmart.com"
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors shrink-0"
                >
                  <Mail className="w-5 h-5" />
                  Email Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </PageLayout>
  );
}

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  ShoppingBag,
  Truck,
  CreditCard,
  User,
  ArrowRight,
} from 'lucide-react';
import { getServerSession } from 'next-auth';

const contactMethods = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Phone Support',
    description: 'Speak directly with our customer service team',
    contact: '1-800-FRESH-MART',
    hours: 'Mon-Fri 8AM-8PM, Sat-Sun 9AM-6PM',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email Support',
    description: "Send us a detailed message and we'll respond within 24 hours",
    contact: 'support@freshmart.com',
    hours: 'Available 24/7',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    contact: 'Available on website',
    hours: 'Mon-Fri 9AM-7PM',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Store Locations',
    description: 'Visit one of our physical locations',
    contact: 'Find nearest store',
    hours: 'Store hours vary by location',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const quickTopics = [
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: 'Order Issues',
    description: 'Problems with your order, delivery, or products',
    href: '/faq#ordering-shopping',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: 'Delivery Questions',
    description: 'Delivery times, tracking, and address changes',
    href: '/delivery',
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Billing & Payments',
    description: 'Payment methods, refunds, and billing issues',
    href: '/faq#payment-refunds',
  },
  {
    icon: <User className="w-5 h-5" />,
    title: 'Account Help',
    description: 'Login issues, password reset, and account settings',
    href: '/auth/signin',
  },
];

export default async function ContactPage() {
  const session = await getServerSession();

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Us
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team through multiple channels. We're here to
            help with any questions or concerns you may have about FreshMart.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contact Methods
            </h2>
            <p className="text-gray-600">Choose the best way to reach us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${method.bgColor}`}>
                      <span className={method.color}>{method.icon}</span>
                    </div>
                    {method.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {method.contact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{method.hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Help Topics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Help Topics
            </h2>
            <p className="text-gray-600">Find answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTopics.map((topic, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600">{topic.icon}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {topic.description}
                  </p>
                  <Link href={topic.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Ticket Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-green-600" />
                Need Personalized Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                For detailed support requests, account-specific issues, or
                complex inquiries, create a support ticket. This allows us to
                track your request and provide personalized assistance.
              </p>

              {session ? (
                <Link href="/support">
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Create Support Tickets
                  </Button>
                </Link>
              ) : (
                <>
                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Login Required for Support Tickets
                    </h4>
                    <p className="text-green-700 text-sm">
                      To create a support ticket and access personalized
                      customer support, please sign in to your FreshMart
                      account. This helps us provide you with the best possible
                      assistance and track your support history.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/signin">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <User className="w-4 h-4 mr-2" />
                        Sign In to Create Ticket
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button variant="outline">Create Account</Button>
                    </Link>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/signup"
                      className="text-green-600 hover:underline"
                    >
                      Sign up
                    </Link>{' '}
                    in just a few seconds.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Business Hours
            </h2>
            <p className="text-gray-600">When you can reach us</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Phone Support</span>
                    <span className="text-gray-600">
                      Mon-Fri: 8AM-8PM | Sat-Sun: 9AM-6PM
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Email Support</span>
                    <span className="text-gray-600">
                      24/7 (responses within 24 hours)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Live Chat</span>
                    <span className="text-gray-600">Mon-Fri: 9AM-7PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Store Locations</span>
                    <span className="text-gray-600">
                      Varies by location (check store finder)
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm text-center">
                    <strong>Holiday Schedule:</strong> Our hours may vary during
                    holidays. Check our website or call ahead for the most
                    current information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

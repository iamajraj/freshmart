import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Mail,
  Phone,
  CheckCircle,
  CreditCard,
  Cookie,
  Users,
  AlertTriangle,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="w-4 h-4 mr-2" />
            Privacy Policy
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Privacy Matters to Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn how we collect, use, and protect your personal information
            when you use FreshMart services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy Policy Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  FreshMart is committed to protecting your privacy and ensuring
                  the security of your personal information. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you use our website, mobile application, and
                  services.
                </p>
                <p>
                  By using our services, you agree to the collection and use of
                  information in accordance with this policy. We will not use or
                  share your information except as described in this Privacy
                  Policy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Personal Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                      <li>Name, email address, and phone number</li>
                      <li>Delivery address and billing address</li>
                      <li>
                        Payment information (processed securely by third-party
                        providers)
                      </li>
                      <li>Account preferences and order history</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-600" />
                      Usage Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                      <li>Pages visited and time spent on our website</li>
                      <li>Products viewed and added to cart</li>
                      <li>Order history and shopping preferences</li>
                      <li>Device information and IP address</li>
                      <li>Location data for delivery services</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-orange-600" />
                      Cookies and Tracking Technologies
                    </h3>
                    <p className="text-gray-600 mb-3">
                      We use cookies and similar technologies to enhance your
                      experience:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                      <li>
                        <strong>Essential cookies:</strong> Required for website
                        functionality
                      </li>
                      <li>
                        <strong>Analytics cookies:</strong> Help us understand
                        how you use our site
                      </li>
                      <li>
                        <strong>Marketing cookies:</strong> Used to show
                        relevant advertisements
                      </li>
                      <li>
                        <strong>Preference cookies:</strong> Remember your
                        settings and preferences
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Service Delivery
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Process and fulfill your orders</li>
                      <li>• Arrange delivery to your location</li>
                      <li>• Provide customer support</li>
                      <li>• Send order confirmations and updates</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Account Management
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Create and manage your account</li>
                      <li>• Process payments securely</li>
                      <li>• Save your preferences</li>
                      <li>• Provide order history</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Communication
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Send service-related notifications</li>
                      <li>• Respond to your inquiries</li>
                      <li>• Send marketing communications (with consent)</li>
                      <li>• Provide important updates</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Improvement</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Analyze usage patterns</li>
                      <li>• Improve our services</li>
                      <li>• Develop new features</li>
                      <li>• Ensure security</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Information Sharing and Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      We DO NOT sell your personal information
                    </h4>
                    <p className="text-green-700 text-sm">
                      We do not sell, trade, or rent your personal information
                      to third parties for marketing purposes.
                    </p>
                  </div>

                  <p className="text-gray-600">
                    We may share your information in the following
                    circumstances:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <strong>Service Providers:</strong> With trusted
                        partners who help us operate our business (delivery
                        services, payment processors, customer support)
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <strong>Legal Requirements:</strong> When required by
                        law or to protect our rights and safety
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <strong>Business Transfers:</strong> In connection with
                        a merger, acquisition, or sale of assets
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    We implement appropriate technical and organizational
                    measures to protect your personal information:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Encryption</h4>
                      <p className="text-sm text-gray-600">
                        All data transmitted is encrypted using SSL/TLS
                        protocols
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Access Controls</h4>
                      <p className="text-sm text-gray-600">
                        Limited access to personal data on a need-to-know basis
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Regular Audits</h4>
                      <p className="text-sm text-gray-600">
                        Security assessments and vulnerability testing
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Data Minimization</h4>
                      <p className="text-sm text-gray-600">
                        We only collect and retain necessary information
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    You have the following rights regarding your personal
                    information:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Access & Portability
                      </h4>
                      <p className="text-sm text-gray-600">
                        Request a copy of your personal data
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Correction</h4>
                      <p className="text-sm text-gray-600">
                        Update or correct inaccurate information
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Deletion</h4>
                      <p className="text-sm text-gray-600">
                        Request deletion of your personal data
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Opt-out</h4>
                      <p className="text-sm text-gray-600">
                        Unsubscribe from marketing communications
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      To exercise these rights, contact us at
                      privacy@freshmart.com or through your account settings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Privacy Officer</h4>
                    <p className="text-gray-600">privacy@freshmart.com</p>
                    <p className="text-gray-600">1-800-PRIVACY</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mailing Address</h4>
                    <p className="text-gray-600">
                      FreshMart Privacy Team
                      <br />
                      123 Grocery Street
                      <br />
                      Food City, FC 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

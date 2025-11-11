import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  AlertTriangle,
  Shield,
  Scale,
  CreditCard,
  Truck,
  Users,
  Phone,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="w-4 h-4 mr-2" />
            Terms of Service
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using FreshMart services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  By accessing and using FreshMart's website, mobile application, and services, you accept and agree to be bound by
                  the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service apply to all visitors, users, and others who access or use our services. By using our services,
                  you represent that you are at least 18 years old and have the legal capacity to enter into this agreement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Use License
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Permission is granted to temporarily access the materials (information or software) on FreshMart's website for personal,
                    non-commercial transitory viewing only.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <strong>Not Permitted:</strong> You may not modify, copy, distribute, transmit, display, perform, reproduce,
                        publish, license, create derivative works from, transfer, or sell any information obtained from this website.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <strong>Prohibited Uses:</strong> Using the service for any unlawful purpose or to solicit others to perform unlawful acts.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Account Responsibilities:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                        <li>You are responsible for safeguarding your account password</li>
                        <li>You agree not to disclose your password to any third party</li>
                        <li>You must notify us immediately of any unauthorized use</li>
                        <li>You are responsible for all activities under your account</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Account Termination:</h4>
                      <p className="text-gray-600">
                        We may terminate or suspend your account and bar access to the service immediately, without prior notice,
                        for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Orders and Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Order Acceptance:</h4>
                    <p className="text-gray-600">
                      All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order
                      for any reason, including limitations on quantities available for purchase.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Pricing and Payment:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>All prices are subject to change without notice</li>
                      <li>Payment is due at the time of order placement</li>
                      <li>We accept major credit cards and digital payment methods</li>
                      <li>Taxes and delivery fees will be added to your order total</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Order Cancellation:</h4>
                    <p className="text-gray-600">
                      Orders may be cancelled within 30 minutes of placement. Once an order is being prepared or has shipped,
                      cancellation may not be possible and you may be charged for the order.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Delivery services are provided subject to the following terms and conditions:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Delivery Times:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                        <li>Delivery windows are estimates, not guarantees</li>
                        <li>Delays may occur due to traffic, weather, or other factors</li>
                        <li>We will notify you of any significant delays</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Delivery Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                        <li>Adult signature required for orders over $100</li>
                        <li>Provide accurate delivery instructions</li>
                        <li>Be available to receive delivery during selected window</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Failed Deliveries:</h4>
                    <p className="text-gray-600">
                      If delivery cannot be completed due to incorrect address, refusal to accept delivery, or other reasons
                      attributable to the customer, additional delivery fees may apply for redelivery attempts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Product Information and Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    We strive to provide accurate product information and maintain high quality standards:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Product Descriptions:</h4>
                      <p className="text-gray-600">
                        Product descriptions, images, and specifications are for illustrative purposes only.
                        Actual products may vary slightly due to seasonal availability and supplier changes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Quality Guarantee:</h4>
                      <p className="text-gray-600">
                        We guarantee product freshness and quality. If you are not satisfied with any product,
                        contact us within 24 hours of delivery for a replacement or refund.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Allergies and Dietary Restrictions:</h4>
                      <p className="text-gray-600">
                        While we take allergen concerns seriously, cross-contamination may occur during storage and delivery.
                        Customers with severe allergies should exercise caution.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    In no event shall FreshMart, nor its directors, employees, partners, agents, suppliers, or affiliates,
                    be liable for any indirect, incidental, special, consequential, or punitive damages.
                  </p>
                  <p className="text-gray-600">
                    Our total liability shall not exceed the amount paid by you for the products or services giving rise to the claim.
                  </p>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Important:</strong> This limitation applies to the fullest extent permitted by applicable law.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  These Terms shall be interpreted and governed by the laws of the jurisdiction in which FreshMart operates,
                  without regard to its conflict of law provisions. Our failure to enforce any right or provision of these
                  Terms will not be considered a waiver of those rights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                  If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
                <p className="text-gray-600">
                  What constitutes a material change will be determined at our sole discretion. By continuing to access
                  or use our service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Support</h4>
                    <p className="text-gray-600">support@freshmart.com</p>
                    <p className="text-gray-600">1-800-FRESH-MART</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Legal Department</h4>
                    <p className="text-gray-600">legal@freshmart.com</p>
                    <p className="text-gray-600">Mon-Fri 9AM-5PM</p>
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

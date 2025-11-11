import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Package,
  Phone,
} from 'lucide-react';

export default function DeliveryPage() {
  const deliveryOptions = [
    {
      name: 'Standard Delivery',
      time: '2-3 hours',
      fee: 'FREE on orders $50+',
      description: 'Perfect for planned shopping',
      icon: <Package className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Express Delivery',
      time: '30-60 minutes',
      fee: '$9.99',
      description: 'When you need it now',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Same-Day Delivery',
      time: 'Same day (after 2 PM)',
      fee: '$4.99',
      description: 'Order before 2 PM for same-day delivery',
      icon: <Truck className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    }
  ];

  const deliveryZones = [
    {
      zone: 'Zone A (Downtown)',
      areas: 'Downtown, Financial District, Waterfront',
      deliveryTime: '30-60 min',
      minOrder: '$25',
      express: 'Available',
    },
    {
      zone: 'Zone B (Midtown)',
      areas: 'Midtown, Business District, Shopping Areas',
      deliveryTime: '45-75 min',
      minOrder: '$30',
      express: 'Available',
    },
    {
      zone: 'Zone C (Suburbs)',
      areas: 'Residential neighborhoods, Suburbs',
      deliveryTime: '60-90 min',
      minOrder: '$35',
      express: 'Limited',
    },
    {
      zone: 'Zone D (Extended)',
      areas: 'Outskirts, Rural areas',
      deliveryTime: '90-120 min',
      minOrder: '$40',
      express: 'Not available',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-green-50 text-green-700 border-green-200">
            <Truck className="w-4 h-4 mr-2" />
            Delivery Information
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fast, Reliable Grocery Delivery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your fresh groceries delivered right to your door with our flexible delivery options and competitive pricing.
          </p>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Delivery Options</h2>
            <p className="text-gray-600">Choose the delivery speed that fits your schedule</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deliveryOptions.map((option, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${option.bgColor}`}>
                      <span className={option.color}>{option.icon}</span>
                    </div>
                    {option.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{option.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{option.fee}</span>
                    </div>
                    <p className="text-gray-600">{option.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Delivery Zones</h2>
            <p className="text-gray-600">Check if we deliver to your area</p>
          </div>

          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Service Areas & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Zone</th>
                      <th className="text-left py-3 px-4 font-semibold">Areas</th>
                      <th className="text-left py-3 px-4 font-semibold">Delivery Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Min. Order</th>
                      <th className="text-left py-3 px-4 font-semibold">Express Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryZones.map((zone, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{zone.zone}</td>
                        <td className="py-3 px-4 text-gray-600">{zone.areas}</td>
                        <td className="py-3 px-4 text-gray-600">{zone.deliveryTime}</td>
                        <td className="py-3 px-4 text-gray-600">{zone.minOrder}</td>
                        <td className="py-3 px-4">
                          <Badge variant={zone.express === 'Available' ? 'default' : zone.express === 'Limited' ? 'secondary' : 'outline'}>
                            {zone.express}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Delivery Policies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Delivery Policies</h2>
            <p className="text-gray-600">Important information about our delivery service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  What We Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Fresh Products</h4>
                    <p className="text-gray-600">All products delivered fresh with proper temperature control</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">On-Time Delivery</h4>
                    <p className="text-gray-600">95% of orders delivered within the promised time window</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Quality Packaging</h4>
                    <p className="text-gray-600">Eco-friendly packaging that keeps your groceries safe</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Weather Delays</h4>
                    <p className="text-gray-600">Severe weather may cause delivery delays - we'll notify you</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Building Access</h4>
                    <p className="text-gray-600">Provide clear delivery instructions for secure buildings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Signature Required</h4>
                    <p className="text-gray-600">Adult signature required for all deliveries over $100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help with Delivery?
              </h2>
              <p className="text-gray-600 mb-6">
                Our customer support team is available to help with any delivery questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Contact Support
                </Link>
                <a
                  href="tel:+1-800-FRESH-MART"
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call: 1-800-FRESH-MART
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

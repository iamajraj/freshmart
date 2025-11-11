import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { RecentlyViewed } from '@/components/recently-viewed';
import { HomepageBanner } from '@/components/banner';
import {
  ShoppingBag,
  Truck,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: "asc" },
  });

  console.log(categories);
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomepageBanner />

      {/* Hero Section */}
      <section className="bg-linear-to-br from-green-50 to-emerald-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh groceries
              <br />
              <span className="text-green-600">delivered fast</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get fresh, organic groceries delivered to your door in under 30 minutes.
              Shop from thousands of products with free delivery on orders over $50.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                <Link href="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Now
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                <Link href="/showcase">
                  Showcase
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Free delivery over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span>30-minute delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>100% satisfaction guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find everything you need, organized just for you</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={`/products?category=${category.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.image}</div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <RecentlyViewed maxItems={6} />
        </div>
      </section>

      <Footer />
    </div>
  );
}

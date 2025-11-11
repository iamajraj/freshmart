'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';

const features = [
  {
    id: 'home',
    title: 'Homepage & Discovery',
    description:
      'Modern landing page with dynamic banners and product discovery',
    icon: '🏠',
    screenshots: [
      {
        src: '/screenshots/home/home_page.png',
        title: 'Homepage Overview',
        description:
          'Clean hero section with featured categories and recently viewed products',
      },
      {
        src: '/screenshots/home/home_page_with_banner.png',
        title: 'Homepage with Banner',
        description:
          'Dynamic promotional banners with priority-based display system',
      },
    ],
    details: [
      'Responsive hero section with call-to-action buttons',
      'Featured product categories with product counts',
      'Recently viewed items carousel',
      'Promotional banner rotation system',
      'Mobile-optimized layout',
    ],
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Secure user registration and login system',
    icon: '🔐',
    screenshots: [
      {
        src: '/screenshots/auth/signin_page.png',
        title: 'Sign In Page',
        description:
          'Clean authentication interface with NextAuth.js integration',
      },
      {
        src: '/screenshots/auth/signup_page.png',
        title: 'Sign Up Page',
        description: 'User registration with email verification',
      },
      {
        src: '/screenshots/auth/profile_page.png',
        title: 'User Profile',
        description: 'Account management and preferences dashboard',
      },
    ],
    details: [
      'NextAuth.js integration with JWT sessions',
      'Email/password authentication',
      'User profile management',
      'Secure password handling with bcrypt',
      'Session persistence across devices',
    ],
  },
  {
    id: 'products',
    title: 'Product Management',
    description: 'Advanced product catalog with search and filtering',
    icon: '🛒',
    screenshots: [
      {
        src: '/screenshots/product/products_page.png',
        title: 'Product Catalog',
        description: 'Advanced search and filtering interface',
      },
      {
        src: '/screenshots/product/categories_page.png',
        title: 'Product Categories',
        description: 'Organized category browsing system',
      },
      {
        src: '/screenshots/product/product_view_page.png',
        title: 'Product Details',
        description: 'Detailed product information with reviews',
      },
      {
        src: '/screenshots/extras/wishlist_page.png',
        title: 'Wishlist Management',
        description: 'Saved products with sharing capabilities',
      },
    ],
    details: [
      'Full-text search',
      'Multi-dimensional filtering (price, category, availability)',
      'Responsive product grid with pagination',
      'Detailed product pages',
      'Customer review and rating system',
      'Wishlist management',
    ],
  },
  {
    id: 'checkout',
    title: 'Shopping & Checkout',
    description: 'Seamless shopping experience with advanced cart management',
    icon: '🛒',
    screenshots: [
      {
        src: '/screenshots/checkout/cart_page.png',
        title: 'Shopping Cart',
        description: 'Persistent cart with real-time calculations',
      },
      {
        src: '/screenshots/checkout/checkout_page.png',
        title: 'Checkout Process',
        description: 'Multi-step checkout with rewards integration',
      },
      {
        src: '/screenshots/checkout/checkout_page_with_coupon.png',
        title: 'Checkout with Coupons',
        description: 'Coupon application and discount calculations',
      },
    ],
    details: [
      'Persistent shopping cart across sessions',
      'Real-time price calculations and tax handling',
      'Wishlist integration with one-click transfer',
      'Multi-step checkout with progress indicators',
      'Rewards and coupon redemption during checkout',
    ],
  },
  {
    id: 'orders',
    title: 'Order Management',
    description: 'Complete order lifecycle from purchase to delivery',
    icon: '📦',
    screenshots: [
      {
        src: '/screenshots/order/my_orders_page.png',
        title: 'Order History',
        description: 'Complete order history with status tracking',
      },
      {
        src: '/screenshots/order/order_view_page.png',
        title: 'Order Details',
        description: 'Detailed order information with itemized receipts',
      },
      {
        src: '/screenshots/order/order_view_delivered_status_page.png',
        title: 'Delivered Order',
        description: 'Completed order with delivery confirmation',
      },
    ],
    details: [
      '6-stage order tracking pipeline',
      'Real-time status updates and notifications',
      'Detailed order receipts with item breakdowns',
      'Order history with search and filtering',
      'Reorder functionality from past purchases',
    ],
  },
  {
    id: 'loyalty',
    title: 'Loyalty Program',
    description: 'Advanced 4-tier rewards system with referrals',
    icon: '👑',
    screenshots: [
      {
        src: '/screenshots/extras/loyalty_program_page.png',
        title: 'Loyalty Dashboard',
        description: 'Points balance, tier status, and rewards overview',
      },
    ],
    details: [
      '4-tier progression: Bronze → Silver → Gold → Platinum',
      'Points earning: 10 points per $1 spent',
      'Multiple reward types (discounts, free delivery, products)',
      'Referral program with bonus points',
      'Tier benefits and progress tracking',
    ],
  },
  {
    id: 'support',
    title: 'Customer Support',
    description: 'Multi-priority ticketing system with chat messaging',
    icon: '💬',
    screenshots: [
      {
        src: '/screenshots/support/support_page.png',
        title: 'Support Dashboard',
        description: 'Customer support ticket overview',
      },
      {
        src: '/screenshots/support/support_page_create_ticket_modal.png',
        title: 'Create Support Ticket',
        description:
          'Interactive modal for ticket creation with category and priority selection',
      },
      {
        src: '/screenshots/support/support_page_single_view.png',
        title: 'Ticket Conversation',
        description: 'Real-time chat-style ticket messaging',
      },
    ],
    details: [
      '6 support categories (Order Issues, Product Questions, Delivery Problems, etc.)',
      '4 priority levels (Low, Medium, High, Urgent)',
      'Interactive modal for ticket creation with rich form validation',
      'Real-time messaging between customers and support',
      'Ticket status tracking and history',
      'Knowledge base integration',
    ],
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    description: 'Complete business management and analytics platform',
    icon: '⚙️',
    screenshots: [
      {
        src: '/screenshots/admin/admin_dashboard_page.png',
        title: 'Admin Dashboard',
        description: 'Business intelligence with real-time KPIs',
      },
      {
        src: '/screenshots/admin/admin_products_management_page.png',
        title: 'Product Management',
        description: 'Complete inventory control and CRUD operations',
      },
      {
        src: '/screenshots/admin/admin_orders_management_page.png',
        title: 'Order Management',
        description: 'Order fulfillment and processing pipeline',
      },
      {
        src: '/screenshots/admin/admin_users_management_page.png',
        title: 'User Management',
        description: 'Customer administration and role management',
      },
      {
        src: '/screenshots/admin/admin_support_management_page.png',
        title: 'Support Management',
        description: 'Customer service ticket handling',
      },
      {
        src: '/screenshots/admin/admin_support_ticket_single_view_page.png',
        title: 'Support Single View',
        description: 'Customer service ticket single view',
      },
      {
        src: '/screenshots/admin/admin_campaigns_page.png',
        title: 'Campaign Management',
        description: 'Marketing campaigns and promotions',
      },
      {
        src: '/screenshots/admin/admin_coupon_management_page.png',
        title: 'Coupon Management',
        description: 'Discount code administration',
      },
      {
        src: '/screenshots/admin/admin_banner_management_page.png',
        title: 'Banner Management',
        description: 'Promotional content management',
      },
      {
        src: '/screenshots/admin/admin_categories_management_page.png',
        title: 'Category Management',
        description: 'Product category organization',
      },
      {
        src: '/screenshots/admin/admin_add_new_product_modal.png',
        title: 'Add New Product Modal',
        description:
          'Product creation modal with inventory and category settings',
      },
      {
        src: '/screenshots/admin/admin_add_new_category_modal.png',
        title: 'Add New Category Modal',
        description: 'Category creation modal for product organization',
      },
      {
        src: '/screenshots/admin/admin_campaigns_edit_modal.png',
        title: 'Edit Campaign Modal',
        description: 'Campaign configuration modal with rules and targeting',
      },
      {
        src: '/screenshots/admin/admin_banner_edit_modal.png',
        title: 'Edit Banner Modal',
        description:
          'Banner management modal with scheduling and priority settings',
      },
      {
        src: '/screenshots/admin/admin_edit_coupon_modal.png',
        title: 'Edit Coupon Modal',
        description:
          'Coupon configuration modal with usage limits and expiration',
      },
      {
        src: '/screenshots/admin/admin_users_profile_details_modal.png',
        title: 'User Profile Details Modal',
        description:
          'Customer profile modal with order history and preferences',
      },
      {
        src: '/screenshots/admin/admin_view_redemption_details_modal.png',
        title: 'Redemption Details Modal',
        description: 'Rewards redemption details and approval workflow',
      },
      {
        src: '/screenshots/admin/admin_redemption_management_page.png',
        title: 'Redemption Management',
        description: 'Rewards redemption processing and approval',
      },
    ],
    details: [
      'Real-time business intelligence dashboard',
      'Complete product and inventory management with modal interfaces',
      'Order fulfillment and processing pipeline',
      'Customer support ticket administration',
      'Marketing campaign and promotion management',
      'Interactive modal-based CRUD operations for products, categories, campaigns',
      'User administration with detailed profile modals',
      'Rewards redemption approval workflow with modal details',
      'Analytics and reporting capabilities',
      'Bulk operations and data export functionality',
    ],
  },
  {
    id: 'info',
    title: 'Information Pages',
    description: 'Legal and informational content pages',
    icon: '📄',
    screenshots: [
      {
        src: '/screenshots/info/contact_page.png',
        title: 'Contact Page',
        description: 'Customer service contact information',
      },
      {
        src: '/screenshots/info/delivery_info_page.png',
        title: 'Delivery Information',
        description: 'Shipping zones, times, and delivery policies',
      },
      {
        src: '/screenshots/info/faq_page.png',
        title: 'FAQ Page',
        description: 'Frequently asked questions and answers',
      },
      {
        src: '/screenshots/info/privacy_page.png',
        title: 'Privacy Policy',
        description: 'Data protection and privacy information',
      },
      {
        src: '/screenshots/info/terms_page.png',
        title: 'Terms of Service',
        description: 'Legal terms and service agreements',
      },
    ],
    details: [
      'Professional contact page with support information',
      'Comprehensive delivery and shipping information',
      'Detailed FAQ section with search functionality',
      'GDPR-compliant privacy policy',
      'Complete terms of service documentation',
    ],
  },
];

export default function ShowcasePage() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FreshMart Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Explore the complete feature set of our modern e-commerce platform
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                33 Total Pages
            </span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Vertical Tabs */}
          <div className="w-80 shrink-0">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Click to explore each feature in detail
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] overflow-y-auto">
                  <div className="space-y-1 p-4">
                    {features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => setActiveFeature(feature)}
                        className={cn(
                          'cursor-pointer w-full text-left p-4 rounded-lg transition-colors hover:bg-gray-50',
                          activeFeature.id === feature.id
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'border-l-4 border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{feature.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {feature.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{activeFeature.icon}</span>
                  <div>
                    <CardTitle className="text-2xl">
                      {activeFeature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {activeFeature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Feature Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeFeature.details.map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Screenshots */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Screenshots</h3>
                  <div className="space-y-6">
                    {activeFeature.screenshots.map((screenshot, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {screenshot.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {screenshot.description}
                            </p>
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                          <Image
                            src={screenshot.src}
                            alt={screenshot.title}
                            width={1200}
                            height={800}
                            className="w-full h-auto"
                            priority={index === 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Details */}
                {activeFeature.id === 'admin' && (
                  <div className="mt-8 space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Modal Interfaces
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          • Product creation and editing modals with inventory
                          management
                        </p>
                        <p>
                          • Category organization modals with hierarchical
                          structure
                        </p>
                        <p>
                          • Campaign configuration modals with advanced
                          targeting rules
                        </p>
                        <p>
                          • Coupon management modals with usage limit controls
                        </p>
                        <p>
                          • Banner scheduling modals with priority and timing
                          settings
                        </p>
                        <p>
                          • User profile detail modals with comprehensive
                          information
                        </p>
                        <p>• Rewards redemption approval workflow modals</p>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">
                        Technical Architecture
                      </h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>
                          • Built with Next.js 16 and TypeScript for type safety
                        </p>
                        <p>
                          • PostgreSQL database with Prisma ORM for data
                          management
                        </p>
                        <p>
                          • Real-time updates with optimized queries and caching
                        </p>
                        <p>
                          • Role-based access control with secure authentication
                        </p>
                        <p>• Responsive design with modern UI components</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

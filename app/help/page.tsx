"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  ShoppingBag,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  Settings,
  FileText,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      icon: ShoppingBag,
      title: "Orders & Shopping",
      description: "Help with placing orders, payment, and shopping",
      color: "bg-blue-100 text-blue-600",
      topics: [
        "How to place an order",
        "Payment methods accepted",
        "Order confirmation issues",
        "Modifying or canceling orders",
        "Bulk order discounts"
      ]
    },
    {
      icon: Package,
      title: "Shipping & Delivery",
      description: "Track orders, delivery times, and shipping info",
      color: "bg-green-100 text-green-600",
      topics: [
        "Shipping times and costs",
        "Order tracking",
        "Delivery address changes",
        "Missing or damaged packages",
        "International shipping"
      ]
    },
    {
      icon: RotateCcw,
      title: "Returns & Exchanges",
      description: "Return policy, exchanges, and refunds",
      color: "bg-orange-100 text-orange-600",
      topics: [
        "Return policy and process",
        "How to initiate a return",
        "Exchange for different size",
        "Refund processing time",
        "Return shipping costs"
      ]
    },
    {
      icon: User,
      title: "Account & Profile",
      description: "Account management and profile settings",
      color: "bg-purple-100 text-purple-600",
      topics: [
        "Creating an account",
        "Password reset",
        "Update profile information",
        "Order history",
        "Account security"
      ]
    },
    {
      icon: Settings,
      title: "Custom Products",
      description: "Help with custom designs and personalization",
      color: "bg-pink-100 text-pink-600",
      topics: [
        "Custom t-shirt designer",
        "File upload requirements",
        "Design guidelines",
        "Custom product pricing",
        "Design approval process"
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Payment issues, billing, and invoices",
      color: "bg-indigo-100 text-indigo-600",
      topics: [
        "Payment methods",
        "Payment security",
        "Failed payment issues",
        "Invoice and receipts",
        "Refund to payment method"
      ]
    }
  ];

  const quickActions = [
    {
      title: "Track Your Order",
      description: "Get real-time updates on your package",
      icon: Package,
      href: "/track-order",
      color: "bg-blue-600"
    },
    {
      title: "Size Guide",
      description: "Find your perfect fit",
      icon: FileText,
      href: "/size-guide",
      color: "bg-green-600"
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      icon: MessageCircle,
      href: "/contact",
      color: "bg-purple-600"
    },
    {
      title: "FAQ",
      description: "Find answers to common questions",
      icon: HelpCircle,
      href: "/faq",
      color: "bg-orange-600"
    }
  ];

  const popularArticles = [
    {
      title: "How to Design a Custom T-Shirt",
      category: "Custom Products",
      readTime: "5 min read",
      views: "2.1k views"
    },
    {
      title: "Understanding Our Size Charts",
      category: "Size Guide",
      readTime: "3 min read",
      views: "1.8k views"
    },
    {
      title: "Return and Exchange Process",
      category: "Returns",
      readTime: "4 min read",
      views: "1.5k views"
    },
    {
      title: "Payment Methods and Security",
      category: "Payments",
      readTime: "3 min read",
      views: "1.2k views"
    },
    {
      title: "Shipping Times and Costs",
      category: "Shipping",
      readTime: "2 min read",
      views: "1.1k views"
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "Available 9 AM - 6 PM IST",
      action: "Start Chat",
      color: "bg-blue-600"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "+91 12345 67890",
      availability: "Mon-Fri, 9 AM - 6 PM IST",
      action: "Call Now",
      color: "bg-green-600"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "lunarz.info@gmail.com",
      availability: "Response within 24 hours",
      action: "Send Email",
      color: "bg-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Help Center</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Find answers, get support, and learn how to make the most of Lunarz
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                    <p className="text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{category.title}</h3>
                      <p className="text-sm text-gray-600 font-normal">{category.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Help Articles</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {popularArticles.map((article, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {article.category}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.readTime}
                        </span>
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <option.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                  <p className="text-gray-700 mb-2">{option.description}</p>
                  <p className="text-sm text-gray-600 mb-4">{option.availability}</p>
                  <Button className={`${option.color} hover:opacity-90`}>
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Company Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/privacy-policy" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Privacy Policy</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/terms-of-service" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Terms of Service</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/refund-policy" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Refund Policy</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/shipping-policy" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Shipping Policy</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Community */}
          <Card>
            <CardHeader>
              <CardTitle>Community & Social</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Follow us on Instagram</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Join our Facebook Community</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <Link href="/blog" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Read our Blog</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/sustainability" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span>Sustainability Efforts</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Still Need Help */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? Our customer support team is here to help 
                you with any questions or issues you might have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call +91 12345 67890
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Available Monday - Friday, 9:00 AM - 6:00 PM IST
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, HelpCircle } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // Orders & Shipping
  {
    id: 1,
    category: "Orders & Shipping",
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days within India. Express shipping (1-2 business days) is available for an additional fee. International shipping takes 7-14 business days depending on the destination."
  },
  {
    id: 2,
    category: "Orders & Shipping",
    question: "Can I track my order?",
    answer: "Yes! Once your order ships, you'll receive a tracking number via email and SMS. You can also track your order by logging into your account and visiting the 'My Orders' section."
  },
  {
    id: 3,
    category: "Orders & Shipping",
    question: "What are the shipping charges?",
    answer: "Free shipping on orders above ₹999. For orders below ₹999, shipping charges are ₹99 for standard delivery and ₹199 for express delivery."
  },
  {
    id: 4,
    category: "Orders & Shipping",
    question: "Can I change or cancel my order?",
    answer: "You can cancel or modify your order within 1 hour of placing it. After that, please contact our customer support team, and we'll do our best to help you."
  },

  // Custom Products
  {
    id: 5,
    category: "Custom Products",
    question: "What file formats do you accept for custom designs?",
    answer: "We accept PNG, JPG, JPEG, and GIF files. For best quality, we recommend high-resolution images (300 DPI) with transparent backgrounds for PNG files."
  },
  {
    id: 6,
    category: "Custom Products",
    question: "How long does it take to produce custom items?",
    answer: "Custom products typically take 2-3 business days to produce, plus shipping time. During peak seasons, it may take up to 5 business days."
  },
  {
    id: 7,
    category: "Custom Products",
    question: "Can I see a preview before my custom item is printed?",
    answer: "Yes! Our design tool shows you a real-time preview of your custom product. You can adjust the design, size, and position before placing your order."
  },
  {
    id: 8,
    category: "Custom Products",
    question: "What's the maximum file size for uploads?",
    answer: "The maximum file size for design uploads is 5MB. If your file is larger, please compress it or contact our support team for assistance."
  },

  // Returns & Exchanges
  {
    id: 9,
    category: "Returns & Exchanges",
    question: "What's your return policy?",
    answer: "We offer a 7-day return policy for unused items in original condition with tags attached. Custom/personalized items are non-returnable unless there's a manufacturing defect."
  },
  {
    id: 10,
    category: "Returns & Exchanges",
    question: "How do I initiate a return?",
    answer: "Log into your account, go to 'My Orders', select the item you want to return, and click 'Return Item'. You can also contact our customer support team for assistance."
  },
  {
    id: 11,
    category: "Returns & Exchanges",
    question: "Who pays for return shipping?",
    answer: "If the return is due to our error (wrong item, defective product), we'll provide a prepaid return label. For other returns, the customer is responsible for return shipping costs."
  },
  {
    id: 12,
    category: "Returns & Exchanges",
    question: "When will I receive my refund?",
    answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method."
  },

  // Payment & Pricing
  {
    id: 13,
    category: "Payment & Pricing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery (COD) for eligible orders."
  },
  {
    id: 14,
    category: "Payment & Pricing",
    question: "Is cash on delivery available?",
    answer: "Yes, COD is available for orders up to ₹5,000 within India. A COD fee of ₹49 applies to all COD orders."
  },
  {
    id: 15,
    category: "Payment & Pricing",
    question: "Do you offer any discounts or coupons?",
    answer: "Yes! We regularly offer discounts and promotional codes. Sign up for our newsletter or follow us on social media to stay updated on the latest offers."
  },
  {
    id: 16,
    category: "Payment & Pricing",
    question: "Are prices inclusive of taxes?",
    answer: "Yes, all prices displayed on our website are inclusive of applicable taxes (GST). No additional charges will be added at checkout."
  },

  // Product Information
  {
    id: 17,
    category: "Product Information",
    question: "What materials do you use?",
    answer: "We use premium quality 100% cotton for our t-shirts, cotton blends for hoodies, and high-quality polyester for certain specialty items. All materials are pre-shrunk and colorfast."
  },
  {
    id: 18,
    category: "Product Information",
    question: "How do I choose the right size?",
    answer: "Please refer to our size chart available on each product page. We recommend measuring yourself and comparing with our size guide for the best fit."
  },
  {
    id: 19,
    category: "Product Information",
    question: "How should I care for my products?",
    answer: "Machine wash cold with like colors, tumble dry low, and avoid bleach. For custom printed items, wash inside out to preserve the design quality."
  },
  {
    id: 20,
    category: "Product Information",
    question: "Do colors vary from what I see on screen?",
    answer: "Colors may vary slightly due to monitor settings and lighting conditions. We strive to represent colors as accurately as possible in our product photos."
  },

  // Account & Support
  {
    id: 21,
    category: "Account & Support",
    question: "Do I need an account to place an order?",
    answer: "While you can browse our products without an account, you'll need to create one to place an order. This helps us provide better service and order tracking."
  },
  {
    id: 22,
    category: "Account & Support",
    question: "How can I contact customer support?",
    answer: "You can reach us via email at lunarz.info@gmail.com, phone at +91 12345 67890 (Mon-Fri, 9 AM-6 PM), or through our contact form on the website."
  },
  {
    id: 23,
    category: "Account & Support",
    question: "Can I save my designs for later?",
    answer: "Yes! When you create a custom design, you can save it to your account and access it later to make modifications or reorder."
  },
  {
    id: 24,
    category: "Account & Support",
    question: "Do you offer bulk order discounts?",
    answer: "Yes! We offer special pricing for bulk orders of 50+ items. Please contact our sales team at lunarz.info@gmail.com for a custom quote."
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = ["All", ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Find answers to common questions about our products, orders, and services
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-600 font-medium mb-1">
                          {item.category}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.question}
                        </h3>
                      </div>
                      {openItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  {openItems.includes(item.id) && (
                    <CardContent className="px-6 pb-6 pt-0">
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse different categories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </Link>
                <a 
                  href="mailto:lunarz.info@gmail.com"
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
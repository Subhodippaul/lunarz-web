"use client";
import Link from "next/link";
import { useState } from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronUp,
  ChevronDown
} from "lucide-react";

export default function Footer() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const footerSections = {
    shop: {
      title: "Shop",
      links: [
        { name: "All Products", href: "/products" },
        { name: "T-Shirts", href: "/products?category=t-shirts" },
        { name: "Hoodies", href: "/products?category=hoodies" },
        { name: "New Arrivals", href: "/products?sort=newest" },
        { name: "Best Sellers", href: "/products?sort=popular" },
        { name: "Sale", href: "/products?sale=true" }
      ]
    },
    support: {
      title: "Customer Support",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/faq" },
        { name: "Shipping Policy", href: "/shipping-policy" },
        { name: "Refund Policy", href: "/refund-policy" },
        { name: "Size Guide", href: "/size-guide" },
        { name: "Track Your Order", href: "/track-order" },
        { name: "Help Center", href: "/help" }
      ]
    },
    company: {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Our Story", href: "/our-story" },
        // { name: "Careers", href: "/careers" },
        // { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
        { name: "Sustainability", href: "/sustainability" },
        // { name: "Affiliate Program", href: "/affiliate" }
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms of Service", href: "/terms-of-service" },
        { name: "Cookie Policy", href: "/cookie-policy" },
        { name: "Terms & Conditions", href: "/terms-conditions" }
      ]
    }
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/lunarz", color: "hover:text-blue-600" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/lunarz", color: "hover:text-pink-600" },
    // { name: "Twitter", icon: Twitter, href: "https://twitter.com/lunarz", color: "hover:text-blue-400" },
    // { name: "YouTube", icon: Youtube, href: "https://youtube.com/lunarz", color: "hover:text-red-600" }
  ];

  const paymentMethods = [
    "Visa", "Mastercard", "American Express", "PayPal", "Razorpay", "UPI", "Net Banking"
  ];

  const features = [
    { icon: Truck, title: "Free Shipping", desc: "On orders over ₹999" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
    { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
    { icon: CreditCard, title: "Multiple Payment", desc: "Various payment options" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <feature.icon className="h-8 w-8 text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link href="/" className="text-2xl font-bold text-white">
                LUNARZ
              </Link>
              <p className="text-gray-400 mt-2 text-sm">
                Premium streetwear and lifestyle clothing for the modern generation. 
                Express yourself with our unique designs.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">lunarz.info@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">+91 9432436470</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-300">
                 741,<br /> 
                 SATYA NARAYAN PALLY,<br /> 
                 DAKSHIN BEHALA ROAD, <br /> 
                 Sarsuna, South 24 Parganas, <br /> 
                 Kolkata, West Bengal, 700061, India
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links - Desktop */}
          <div className="hidden md:grid md:grid-cols-4 lg:col-span-4 gap-8">
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer Links - Mobile (Collapsible) */}
          <div className="md:hidden lg:col-span-4">
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key} className="border-b border-gray-800 last:border-b-0">
                <button
                  onClick={() => toggleSection(key)}
                  className="flex items-center justify-between w-full py-4 text-left"
                >
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  {openSections[key] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {openSections[key] && (
                  <ul className="space-y-2 pb-4">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        {/* <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left">
            <h3 className="font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                © 2025 Lunarz. All rights reserved. | Made with ❤️ in India
              </p>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">We Accept:</span>
              <div className="flex items-center space-x-2">
                {paymentMethods.slice(0, 4).map((method) => (
                  <div
                    key={method}
                    className="bg-white rounded px-2 py-1 text-xs font-medium text-gray-800"
                  >
                    {method}
                  </div>
                ))}
                <span className="text-gray-400 text-xs"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
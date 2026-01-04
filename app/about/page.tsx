"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Heart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Lunarz</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Crafting unique fashion experiences that blend creativity, quality, and individual expression
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Our Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-6">
                Founded with a passion for self-expression and creativity, Lunarz began as a dream to make 
                personalized fashion accessible to everyone. We believe that clothing is more than just fabric – 
                it's a canvas for your personality, your story, and your unique style.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                From our humble beginnings to becoming a trusted name in custom apparel, we've remained 
                committed to quality, innovation, and customer satisfaction. Every product we create is 
                a testament to our dedication to helping you express yourself authentically.
              </p>
              <p className="text-lg text-gray-700">
                Today, Lunarz continues to evolve, embracing new technologies and design trends while 
                staying true to our core values of creativity, quality, and customer-centricity.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8 text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">2024</div>
              <div className="text-xl text-gray-700 mb-4">Founded</div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
              <div className="text-lg text-gray-700 mb-4">Happy Customers</div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-lg text-gray-700">Products Delivered</div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Passion</h3>
                <p className="text-gray-600">
                  We pour our heart into every design, ensuring each product reflects our love for creativity and quality.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p className="text-gray-600">
                  Premium materials and meticulous craftsmanship ensure our products stand the test of time.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-gray-600">
                  Building a community of creative individuals who celebrate uniqueness and self-expression.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Constantly evolving our processes and designs to bring you the latest in fashion technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Mission */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl text-gray-700 mb-6">
                To empower individuals to express their unique identity through high-quality, 
                customizable fashion that celebrates creativity and personal style.
              </p>
              <p className="text-lg text-gray-600">
                We strive to make personalized fashion accessible, affordable, and sustainable, 
                while building a community that values authenticity and self-expression.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Lunarz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-3">Custom Designs</h3>
              <p className="text-gray-600">
                Upload your own designs or choose from our curated collection to create something truly unique.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick turnaround times without compromising on quality. Get your custom products in 3-5 business days.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💯</div>
              <h3 className="text-xl font-semibold mb-3">Quality Guarantee</h3>
              <p className="text-gray-600">
                Premium materials and printing techniques ensure your designs look great and last long.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Something Amazing?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers who trust Lunarz for their custom fashion needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/custom-tshirt"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Designing
            </Link>
            <Link 
              href="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
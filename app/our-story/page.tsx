"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, Rocket, Award, Heart, Star } from "lucide-react";
import Link from "next/link";

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            The journey of how a simple idea transformed into a platform for creative expression
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* The Beginning */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold">The Spark of an Idea</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                It all started in early 2024 when our founder was frustrated with the lack of 
                personalization options in the fashion industry. Why should everyone wear the same 
                designs when we're all unique individuals with our own stories to tell?
              </p>
              <p className="text-lg text-gray-700 mb-6">
                The idea was simple yet revolutionary: create a platform where anyone could transform 
                their creativity into wearable art. No design skills required, no minimum orders, 
                just pure creative freedom.
              </p>
              <p className="text-lg text-gray-700">
                That spark of inspiration became the foundation of what would eventually become Lunarz – 
                a brand dedicated to celebrating individuality through custom fashion.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4">The Vision</h3>
              <p className="text-gray-700 text-lg">
                "Everyone deserves to wear their story, not someone else's."
              </p>
              <p className="text-sm text-gray-600 mt-4 italic">- Founder, Lunarz</p>
            </div>
          </div>
        </div>

        {/* The Journey */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-purple-400 to-pink-400 h-full hidden lg:block"></div>
            
            <div className="space-y-12">
              {/* 2024 - Foundation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="lg:text-right">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center lg:justify-end mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Rocket className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Early 2024 - The Launch</h3>
                      <p className="text-gray-600">
                        Lunarz was officially launched with a simple mission: make custom fashion 
                        accessible to everyone. We started with basic t-shirt customization and 
                        a small team of passionate individuals.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Mid 2024 - Growth */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="hidden lg:block"></div>
                <div>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Mid 2024 - Growing Community</h3>
                      <p className="text-gray-600">
                        Our community started growing rapidly. We expanded our product line to 
                        include hoodies, added more customization options, and most importantly, 
                        listened to our customers' feedback.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Late 2024 - Innovation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="lg:text-right">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center lg:justify-end mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Late 2024 - Innovation & Recognition</h3>
                      <p className="text-gray-600">
                        We introduced advanced design tools, improved our printing technology, 
                        and received recognition for our commitment to quality and customer 
                        satisfaction. Our first 10,000 happy customers milestone!
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Present - Today */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="hidden lg:block"></div>
                <div>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <Star className="h-6 w-6 text-pink-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Today - Continuing the Journey</h3>
                      <p className="text-gray-600">
                        Today, Lunarz serves thousands of customers worldwide, offering an 
                        ever-expanding range of customizable products. But this is just the 
                        beginning of our story.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Impact */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-lg font-semibold mb-2">Happy Customers</div>
              <p className="text-gray-600">Individuals who've expressed their creativity through our platform</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-lg font-semibold mb-2">Products Created</div>
              <p className="text-gray-600">Unique designs brought to life with premium quality</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">25+</div>
              <div className="text-lg font-semibold mb-2">Product Variants</div>
              <p className="text-gray-600">Different styles and options to choose from</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">99%</div>
              <div className="text-lg font-semibold mb-2">Satisfaction Rate</div>
              <p className="text-gray-600">Customer satisfaction is our top priority</p>
            </div>
          </div>
        </div>

        {/* Our Values in Action */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Customer-Centric</h3>
                <p className="text-gray-600">
                  Every decision we make is guided by one question: "How does this benefit our customers?" 
                  Your satisfaction and creative expression are at the heart of everything we do.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Quality First</h3>
                <p className="text-gray-600">
                  We never compromise on quality. From the materials we use to the printing techniques 
                  we employ, every product meets our high standards before it reaches you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We're constantly evolving, adding new features, products, and technologies to make 
                  your creative journey easier and more enjoyable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Looking Forward */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-6">The Story Continues...</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            This is just the beginning of our story. With every customer who chooses to express 
            themselves through Lunarz, we're writing new chapters filled with creativity, 
            innovation, and endless possibilities.
          </p>
          <p className="text-lg mb-8">
            We're excited to see what the future holds and grateful to have you as part of our journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/custom-tshirt"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Story
            </Link>
            <Link 
              href="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
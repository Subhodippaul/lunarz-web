"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, the blog post you're looking for doesn't exist or may have been moved. 
            Our blog is currently under development and will be launching soon!
          </p>

          {/* What's Available */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What's Available Now:</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>• Browse our product catalog</li>
              <li>• Create custom t-shirt designs</li>
              <li>• Learn about our sustainability efforts</li>
              <li>• Read our company story</li>
              <li>• Get answers in our FAQ section</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              Want to be notified when our blog launches?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <Button className="bg-green-600 hover:bg-green-700">
                Subscribe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
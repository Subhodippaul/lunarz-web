"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
            <div className="text-6xl mb-4">🔍</div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>

          {/* Helpful Links */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Here's what you can do:</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>• Check the URL for any typos</li>
              <li>• Go back to the previous page</li>
              <li>• Visit our homepage</li>
              <li>• Browse our product catalog</li>
              <li>• Contact us if you need help</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Link href="/products">
              <Button variant="outline">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Shop Products
              </Button>
            </Link>
          </div>

          {/* Popular Pages */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Pages</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Link href="/custom-tshirt" className="text-blue-600 hover:underline">
                Custom T-Shirt Designer
              </Link>
              <Link href="/about" className="text-blue-600 hover:underline">
                About Us
              </Link>
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
              <Link href="/faq" className="text-blue-600 hover:underline">
                FAQ
              </Link>
              <Link href="/sustainability" className="text-blue-600 hover:underline">
                Sustainability
              </Link>
              <Link href="/our-story" className="text-blue-600 hover:underline">
                Our Story
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
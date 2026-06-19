"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, Eye, BarChart3 } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Cookie className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Learn about how we use cookies and similar technologies to enhance your experience
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Last Updated */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <p className="text-orange-800">
            <strong>Last Updated:</strong> January 4, 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cookie className="h-6 w-6 mr-2 text-orange-600" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
              when you visit a website. They help websites remember information about your visit, such 
              as your preferred language and other settings.
            </p>
            <p className="text-gray-700">
              This Cookie Policy explains how Lunarz ("we," "our," or "us") uses cookies and similar 
              technologies when you visit our website.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center mb-2">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">Essential Cookies</h3>
              </div>
              <p className="text-gray-700 mb-2">
                These cookies are necessary for the website to function properly and cannot be disabled.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Authentication and security</li>
                <li>Shopping cart functionality</li>
                <li>Form submission and validation</li>
                <li>Load balancing and performance</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold">Analytics Cookies</h3>
              </div>
              <p className="text-gray-700 mb-2">
                These cookies help us understand how visitors interact with our website.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Page views and user behavior</li>
                <li>Traffic sources and referrals</li>
                <li>Popular content and features</li>
                <li>Website performance metrics</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <div className="flex items-center mb-2">
                <Eye className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold">Functional Cookies</h3>
              </div>
              <p className="text-gray-700 mb-2">
                These cookies enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Language and region preferences</li>
                <li>Customized content and recommendations</li>
                <li>Saved designs and preferences</li>
                <li>Chat and support features</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center mb-2">
                <Settings className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold">Marketing Cookies</h3>
              </div>
              <p className="text-gray-700 mb-2">
                These cookies are used to deliver relevant advertisements and track campaign effectiveness.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Targeted advertising</li>
                <li>Social media integration</li>
                <li>Campaign tracking and attribution</li>
                <li>Retargeting and remarketing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set their own cookies. These services include:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Google Analytics</h3>
                <p className="text-gray-700">
                  Helps us analyze website traffic and user behavior to improve our services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Processors</h3>
                <p className="text-gray-700">
                  Secure payment processing services like Razorpay may set cookies for fraud prevention.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Social Media Platforms</h3>
                <p className="text-gray-700">
                  Social sharing buttons and embedded content may set cookies from platforms like Facebook, Instagram, and Twitter.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Customer Support</h3>
                <p className="text-gray-700">
                  Live chat and support tools may use cookies to maintain conversation history.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cookie Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Session Cookies</h3>
                <p className="text-gray-700">
                  These cookies are temporary and are deleted when you close your browser. They help 
                  maintain your session while browsing our website.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Persistent Cookies</h3>
                <p className="text-gray-700">
                  These cookies remain on your device for a specified period or until you delete them. 
                  They help remember your preferences for future visits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Browser Settings</h3>
              <p className="text-gray-700 mb-2">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>View and delete existing cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Delete all cookies when closing the browser</li>
                <li>Receive notifications when cookies are set</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Browser-Specific Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Chrome</h4>
                  <p className="text-sm text-gray-600">Settings → Privacy and Security → Cookies and other site data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Firefox</h4>
                  <p className="text-sm text-gray-600">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Safari</h4>
                  <p className="text-sm text-gray-600">Preferences → Privacy → Manage Website Data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Edge</h4>
                  <p className="text-sm text-gray-600">Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website 
                and limit your ability to use some features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Opt-Out Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Opt-Out Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Google Analytics</h3>
                <p className="text-gray-700 mb-2">
                  You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on.
                </p>
                <Button variant="outline" className="text-sm">
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Download Opt-out Add-on
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Advertising Cookies</h3>
                <p className="text-gray-700 mb-2">
                  You can opt out of interest-based advertising through industry opt-out pages:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="text-sm">
                    <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
                      Digital Advertising Alliance
                    </a>
                  </Button>
                  <Button variant="outline" className="text-sm">
                    <a href="http://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">
                      Your Online Choices
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Devices */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mobile Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              On mobile devices, you can manage cookies and similar technologies through your device settings:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">iOS Devices</h3>
                <p className="text-gray-700">Settings → Safari → Privacy & Security</p>
              </div>
              <div>
                <h3 className="font-semibold">Android Devices</h3>
                <p className="text-gray-700">Settings → Apps → Browser → Privacy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Updates to This Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any material 
              changes by posting the updated policy on our website.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">lunarz.info@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9432436470</p>
              <p><strong>Address:</strong> 741,
SATYA NARAYAN PALLY,
DAKSHIN BEHALA ROAD,
Sarsuna, South 24 Parganas,
Kolkata, West Bengal, 700061, India</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Scale, Shield } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FileText className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Last Updated */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <strong>Last Updated:</strong> January 4, 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-6 w-6 mr-2 text-blue-600" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") govern your use of the Lunarz website and services 
              operated by Lunarz ("we," "our," or "us"). By accessing or using our services, you 
              agree to be bound by these Terms.
            </p>
            <p className="text-gray-700">
              If you do not agree to these Terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Definitions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              <li><strong>"Service"</strong> refers to the Lunarz website and all related services, features, and content.</li>
              <li><strong>"User," "you," or "your"</strong> refers to any individual or entity using our Service.</li>
              <li><strong>"Content"</strong> refers to all text, images, designs, and other materials uploaded or created through our Service.</li>
              <li><strong>"Products"</strong> refers to all items available for purchase through our Service.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Use of Service */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use of Our Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Eligibility</h3>
              <p className="text-gray-700">
                You must be at least 18 years old to use our Service. If you are under 18, you may 
                use our Service only with the involvement and consent of a parent or guardian.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Account Registration</h3>
              <p className="text-gray-700 mb-2">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Keep your account information updated</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Acceptable Use</h3>
              <p className="text-gray-700 mb-2">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Upload content that infringes on intellectual property rights</li>
                <li>Upload offensive, harmful, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Orders and Payments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Orders and Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Acceptance</h3>
              <p className="text-gray-700">
                All orders are subject to acceptance by us. We reserve the right to refuse or cancel 
                any order for any reason, including but not limited to product availability, errors 
                in pricing, or suspected fraudulent activity.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Pricing</h3>
              <p className="text-gray-700">
                All prices are listed in Indian Rupees (₹) and include applicable taxes. Prices are 
                subject to change without notice. We are not responsible for pricing errors.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Payment</h3>
              <p className="text-gray-700">
                Payment is required at the time of order placement. We accept various payment methods 
                as displayed during checkout. By providing payment information, you represent that you 
                are authorized to use the payment method.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping and Delivery */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Shipping and Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We will make reasonable efforts to deliver products within the estimated timeframes. 
              However, delivery times are estimates and not guarantees. We are not liable for delays 
              caused by circumstances beyond our control.
            </p>
            <p className="text-gray-700">
              Risk of loss and title for products pass to you upon delivery to the shipping carrier.
            </p>
          </CardContent>
        </Card>

        {/* Returns and Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Returns and Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Our return and refund policy is detailed in our separate Refund Policy. By using our 
              Service, you agree to the terms of our Refund Policy.
            </p>
            <p className="text-gray-700">
              Custom and personalized products are generally non-returnable unless there is a 
              manufacturing defect or error on our part.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Our Content</h3>
              <p className="text-gray-700">
                The Service and its original content, features, and functionality are owned by Lunarz 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">User Content</h3>
              <p className="text-gray-700 mb-2">
                By uploading content to our Service, you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Retain ownership of your content</li>
                <li>Grant us a license to use your content for providing our services</li>
                <li>Represent that you have the right to upload and use the content</li>
                <li>Agree that your content does not infringe on third-party rights</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-yellow-600" />
              Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              WHETHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT OF THIRD-PARTY RIGHTS</li>
              <li>UNINTERRUPTED OR ERROR-FREE SERVICE</li>
              <li>ACCURACY OR RELIABILITY OF INFORMATION</li>
            </ul>
            <p className="text-gray-700">
              We do not warrant that the Service will meet your requirements or that any defects 
              will be corrected.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUNARZ SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO 
              LOSS OF PROFITS, DATA, OR USE.
            </p>
            <p className="text-gray-700">
              Our total liability for any claim arising from or relating to the Service shall not 
              exceed the amount you paid for the specific product or service giving rise to the claim.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless Lunarz and its officers, directors, employees, 
              and agents from any claims, damages, losses, or expenses arising from your use of the 
              Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without 
              prior notice, for any reason, including breach of these Terms.
            </p>
            <p className="text-gray-700">
              Upon termination, your right to use the Service will cease immediately, but provisions 
              that should survive termination will remain in effect.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law and Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              These Terms are governed by and construed in accordance with the laws of India. Any 
              disputes arising from these Terms or the Service shall be subject to the exclusive 
              jurisdiction of the courts in Mumbai, Maharashtra, India.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material 
              changes by posting the updated Terms on our website. Your continued use of the Service 
              after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Severability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Severability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              If any provision of these Terms is found to be unenforceable or invalid, that provision 
              will be limited or eliminated to the minimum extent necessary so that the remaining Terms 
              will remain in full force and effect.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
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
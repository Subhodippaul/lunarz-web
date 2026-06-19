"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Shield, AlertTriangle } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Scale className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms & Conditions</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Complete terms and conditions governing your use of Lunarz services
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Last Updated */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
          <p className="text-purple-800">
            <strong>Last Updated:</strong> January 4, 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-purple-600" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Welcome to Lunarz! These Terms and Conditions ("Terms") constitute a legally binding 
              agreement between you and Lunarz regarding your use of our website, services, and products.
            </p>
            <p className="text-gray-700">
              By accessing or using our services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms. If you do not agree, please discontinue use immediately.
            </p>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-700">
              <p><strong>Company Name:</strong> Lunarz</p>
              <p><strong>Business Address:</strong> 741,
SATYA NARAYAN PALLY,
DAKSHIN BEHALA ROAD,
Sarsuna, South 24 Parganas,
Kolkata, West Bengal, 700061, India</p>
              <p><strong>Email:</strong> <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">lunarz.info@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9432436470</p>
              <p><strong>Website:</strong> <a href="https://lunarz.in/" className="text-blue-600 hover:underline">lunarz.in</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              By using our website or services, you confirm that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>You are at least 18 years old or have parental consent</li>
              <li>You have the legal capacity to enter into binding agreements</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>All information provided by you is accurate and truthful</li>
            </ul>
          </CardContent>
        </Card>

        {/* Services Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Lunarz provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Custom apparel design and printing services</li>
              <li>Ready-to-wear clothing and accessories</li>
              <li>Online design tools and customization platform</li>
              <li>E-commerce website and mobile application</li>
              <li>Customer support and order management</li>
              <li>Shipping and delivery services</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Creation</h3>
              <p className="text-gray-700">
                To access certain features, you must create an account with accurate information. 
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Security</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Use a strong, unique password</li>
                <li>Do not share your login credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Log out from shared or public devices</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these Terms 
                or engage in fraudulent, abusive, or illegal activities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              You agree not to use our services for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Any unlawful purpose or to solicit unlawful acts</li>
              <li>Violating any international, federal, provincial, or state regulations or laws</li>
              <li>Infringing upon or violating intellectual property rights</li>
              <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
              <li>Submitting false or misleading information</li>
              <li>Uploading viruses or malicious code</li>
              <li>Collecting or tracking personal information of others</li>
              <li>Spamming, phishing, or similar activities</li>
              <li>Interfering with or circumventing security features</li>
              <li>Creating multiple accounts to evade restrictions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Content Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Content Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">User-Generated Content</h3>
              <p className="text-gray-700 mb-2">
                When uploading designs or content, you must ensure:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>You own the rights to the content or have proper authorization</li>
                <li>Content does not infringe on third-party intellectual property</li>
                <li>Content is not offensive, discriminatory, or inappropriate</li>
                <li>Content complies with applicable laws and regulations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Prohibited Content</h3>
              <p className="text-gray-700 mb-2">
                We do not allow content that contains:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Hate speech, violence, or discrimination</li>
                <li>Copyrighted material without permission</li>
                <li>Trademarked logos or brands without authorization</li>
                <li>Adult or sexually explicit content</li>
                <li>Political or religious content that may be offensive</li>
                <li>Content promoting illegal activities</li>
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
              <h3 className="font-semibold mb-2">Order Process</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>All orders are subject to acceptance and availability</li>
                <li>We reserve the right to refuse or cancel orders</li>
                <li>Order confirmation does not guarantee acceptance</li>
                <li>Prices are subject to change without notice</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Payment is required at the time of order placement</li>
                <li>All prices are in Indian Rupees (₹) and include applicable taxes</li>
                <li>We accept various payment methods as displayed at checkout</li>
                <li>Failed payments may result in order cancellation</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pricing Errors</h3>
              <p className="text-gray-700">
                In case of pricing errors, we reserve the right to cancel orders and issue 
                full refunds, even after payment confirmation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              Intellectual Property Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Our Intellectual Property</h3>
              <p className="text-gray-700">
                All content on our website, including text, graphics, logos, images, and software, 
                is the property of Lunarz and is protected by copyright, trademark, and other 
                intellectual property laws.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">User Content License</h3>
              <p className="text-gray-700">
                By uploading content, you grant us a non-exclusive, worldwide, royalty-free license 
                to use, reproduce, and display your content solely for the purpose of providing our services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Copyright Infringement</h3>
              <p className="text-gray-700">
                We respect intellectual property rights and will remove infringing content upon 
                receiving valid DMCA takedown notices. Repeat infringers may have their accounts terminated.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our collection, use, and protection of your personal 
              information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-700">
              By using our services, you consent to the collection and use of your information 
              as described in our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers and Warranties */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Disclaimers and Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service Availability</h3>
              <p className="text-gray-700">
                We strive to maintain continuous service availability but do not guarantee 
                uninterrupted access. Services may be temporarily unavailable due to maintenance, 
                updates, or technical issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Product Quality</h3>
              <p className="text-gray-700">
                While we maintain high quality standards, colors and appearance may vary slightly 
                from digital representations due to monitor settings and printing processes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Third-Party Services</h3>
              <p className="text-gray-700">
                We use third-party services for payments, shipping, and other functions. 
                We are not responsible for the performance or policies of these third parties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, Lunarz shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or delays</li>
              <li>Third-party actions or omissions</li>
              <li>Unauthorized access to your account</li>
              <li>Errors in content or pricing</li>
            </ul>
            <p className="text-gray-700">
              Our total liability shall not exceed the amount you paid for the specific 
              product or service giving rise to the claim.
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
              You agree to indemnify, defend, and hold harmless Lunarz, its officers, directors, 
              employees, and agents from any claims, damages, losses, or expenses arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>Your use of our services</li>
              <li>Violation of these Terms</li>
              <li>Infringement of third-party rights</li>
              <li>Your uploaded content or designs</li>
              <li>Any fraudulent or illegal activities</li>
            </ul>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law and Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              These Terms are governed by and construed in accordance with the laws of India, 
              without regard to conflict of law principles.
            </p>
            <p className="text-gray-700">
              Any disputes arising from these Terms or your use of our services shall be subject 
              to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
            </p>
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifications to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. Material changes will be 
              communicated through:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our website</li>
              <li>In-app notifications</li>
            </ul>
            <p className="text-gray-700">
              Continued use of our services after changes constitutes acceptance of the modified Terms.
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
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, 
              the remaining provisions shall continue in full force and effect. The invalid provision 
              shall be replaced with a valid provision that most closely reflects the original intent.
            </p>
          </CardContent>
        </Card>

        {/* Entire Agreement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Entire Agreement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              These Terms, together with our Privacy Policy, Refund Policy, and Shipping Policy, 
              constitute the entire agreement between you and Lunarz regarding the use of our services 
              and supersede all prior agreements and understandings.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              For questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:lunarz.info@gmail.com" className="text-blue-600 hover:underline">lunarz.info@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9432436470</p>
              <p><strong>Address:</strong> 741,
SATYA NARAYAN PALLY,
DAKSHIN BEHALA ROAD,
Sarsuna, South 24 Parganas,
Kolkata, West Bengal, 700061, India</p>
              <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
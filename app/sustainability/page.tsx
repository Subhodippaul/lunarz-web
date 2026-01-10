"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Recycle, 
  Droplets, 
  Sun, 
  Heart, 
  Users, 
  Target, 
  Award,
  TreePine,
  Factory,
  Truck,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";

export default function SustainabilityPage() {
  const commitments = [
    {
      icon: Leaf,
      title: "Eco-Friendly Materials",
      description: "We use organic cotton, recycled polyester, and sustainable fabrics in our products.",
      stats: "85% of our products use sustainable materials"
    },
    {
      icon: Droplets,
      title: "Water Conservation",
      description: "Our printing processes use 40% less water than traditional methods.",
      stats: "2.5 million liters of water saved annually"
    },
    {
      icon: Recycle,
      title: "Waste Reduction",
      description: "Zero-waste production with fabric scraps recycled into new products.",
      stats: "95% waste diversion from landfills"
    },
    {
      icon: Sun,
      title: "Renewable Energy",
      description: "Our facilities are powered by 100% renewable energy sources.",
      stats: "Carbon neutral production since 2024"
    }
  ];

  const initiatives = [
    {
      title: "Sustainable Sourcing",
      description: "We partner with certified suppliers who share our commitment to environmental responsibility.",
      icon: Factory,
      details: [
        "GOTS certified organic cotton suppliers",
        "Recycled polyester from plastic bottles",
        "Low-impact dyes and chemicals",
        "Fair trade partnerships"
      ]
    },
    {
      title: "Responsible Production",
      description: "Our manufacturing processes minimize environmental impact while maintaining quality.",
      icon: TreePine,
      details: [
        "Digital printing reduces water usage",
        "On-demand production minimizes waste",
        "Energy-efficient machinery",
        "Local sourcing reduces transportation"
      ]
    },
    {
      title: "Green Packaging",
      description: "Plastic-free, recyclable packaging made from sustainable materials.",
      icon: ShoppingBag,
      details: [
        "100% recyclable cardboard boxes",
        "Biodegradable poly mailers",
        "Minimal packaging design",
        "Reusable packaging options"
      ]
    },
    {
      title: "Carbon-Neutral Shipping",
      description: "We offset 100% of shipping emissions through verified carbon offset programs.",
      icon: Truck,
      details: [
        "Partnership with carbon-neutral carriers",
        "Optimized delivery routes",
        "Consolidated shipping",
        "Local fulfillment centers"
      ]
    }
  ];

  const goals = [
    {
      year: "2024",
      title: "Carbon Neutral Operations",
      description: "Achieve carbon neutrality across all operations and shipping.",
      status: "Achieved",
      color: "bg-green-100 text-green-800"
    },
    {
      year: "2025",
      title: "100% Sustainable Materials",
      description: "All products made from certified sustainable or recycled materials.",
      status: "In Progress",
      color: "bg-blue-100 text-blue-800"
    },
    {
      year: "2026",
      title: "Circular Fashion Model",
      description: "Launch take-back program for product recycling and upcycling.",
      status: "Planned",
      color: "bg-purple-100 text-purple-800"
    },
    {
      year: "2027",
      title: "Zero Waste to Landfill",
      description: "Eliminate all waste sent to landfills through recycling and composting.",
      status: "Planned",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const certifications = [
    {
      name: "GOTS Certified",
      description: "Global Organic Textile Standard for organic fiber products",
      logo: "🌱"
    },
    {
      name: "OEKO-TEX Standard",
      description: "Ensures textiles are free from harmful substances",
      logo: "🏷️"
    },
    {
      name: "Carbon Trust",
      description: "Certified carbon footprint measurement and reduction",
      logo: "🌍"
    },
    {
      name: "Fair Trade",
      description: "Ethical sourcing and fair labor practices",
      logo: "🤝"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Leaf className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Sustainability</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Fashion that cares for people and planet. Our commitment to a sustainable future.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Mission Statement */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Sustainability Mission</h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-8">
            At Lunarz, we believe fashion should be a force for good. We're committed to creating 
            beautiful, high-quality products while minimizing our environmental impact and supporting 
            ethical practices throughout our supply chain.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-3xl mx-auto">
            <p className="text-green-800 font-semibold">
              "We're not just making clothes – we're crafting a better future for fashion, 
              one sustainable choice at a time."
            </p>
          </div>
        </div>

        {/* Key Commitments */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Environmental Commitments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {commitments.map((commitment, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <commitment.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{commitment.title}</h3>
                  <p className="text-gray-600 mb-4">{commitment.description}</p>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-800 font-semibold text-sm">{commitment.stats}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sustainability Initiatives */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Initiatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {initiatives.map((initiative, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <initiative.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    {initiative.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{initiative.description}</p>
                  <ul className="space-y-2">
                    {initiative.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sustainability Goals Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Sustainability Roadmap</h2>
          <div className="space-y-6">
            {goals.map((goal, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="text-2xl font-bold text-blue-600 mr-4">{goal.year}</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${goal.color}`}>
                          {goal.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
                      <p className="text-gray-600">{goal.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      {goal.status === "Achieved" && (
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      {goal.status === "In Progress" && (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      {goal.status === "Planned" && (
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{cert.logo}</div>
                  <h3 className="font-semibold mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Environmental Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2.5M</div>
              <div className="text-lg font-semibold mb-2">Liters of Water Saved</div>
              <p className="text-gray-600">Through efficient printing processes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15K</div>
              <div className="text-lg font-semibold mb-2">Plastic Bottles Recycled</div>
              <p className="text-gray-600">Into sustainable fabric materials</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-lg font-semibold mb-2">Carbon Neutral</div>
              <p className="text-gray-600">All operations and shipping</p>
            </div>
          </div>
        </div>

        {/* How You Can Help */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-6">How You Can Make a Difference</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold mb-2">Choose Sustainable Products</h3>
                  <p className="text-gray-600">Look for our eco-friendly product labels when shopping</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Care for Your Clothes</h3>
                  <p className="text-gray-600">Wash in cold water and air dry to extend product life</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Spread Awareness</h3>
                  <p className="text-gray-600">Share our sustainability story with friends and family</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Every purchase you make supports our mission to create a more sustainable fashion industry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Leaf className="h-4 w-4 mr-2" />
                    Shop Sustainable Products
                  </Button>
                </Link>
                <Link href="/custom-tshirt">
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Design Custom Eco-Tee
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact for Sustainability */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Questions About Our Sustainability?</h3>
              <p className="text-gray-600 mb-6">
                We're transparent about our practices and always happy to share more details 
                about our sustainability initiatives.
              </p>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get in Touch
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
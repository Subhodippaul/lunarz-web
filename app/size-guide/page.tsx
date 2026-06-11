"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ruler, User, Shirt, Info, ChevronDown, ChevronUp } from "lucide-react";

export default function SizeGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState("t-shirts");
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    "how-to-measure": true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = [
    { id: "Regular", name: "T-Shirts", icon: "👕" },
    { id: "Hoodies", name: "Hoodies", icon: "🧥" },
    { id: "Oversized", name: "Oversized Tees", icon: "👔" }
  ];

  const sizeCharts = {
    "Regular": {
      title: "T-Shirts Size Chart",
      description: "Regular fit t-shirts measurements in inches",
      headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
      rows: [
        ["XS", "34-36", "26", "16", "7"],
        ["S", "36-38", "27", "17", "7.5"],
        ["M", "38-40", "28", "18", "8"],
        ["L", "40-42", "29", "19", "8.5"],
        ["XL", "42-44", "30", "20", "9"],
        ["XXL", "44-46", "31", "21", "9.5"],
        ["XXXL", "46-48", "32", "22", "10"]
      ]
    },
    "Hoodies": {
      title: "Hoodies Size Chart",
      description: "Comfortable fit hoodies measurements in inches",
      headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
      rows: [
        ["XS", "36-38", "25", "17", "23"],
        ["S", "38-40", "26", "18", "24"],
        ["M", "40-42", "27", "19", "25"],
        ["L", "42-44", "28", "20", "26"],
        ["XL", "44-46", "29", "21", "27"],
        ["XXL", "46-48", "30", "22", "28"],
        ["XXXL", "48-50", "31", "23", "29"]
      ]
    },
    "Oversized": {
      title: "Oversized T-Shirts Size Chart",
      description: "Relaxed oversized fit measurements in inches",
      headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
      rows: [
        ["XS", "40-42", "27", "18", "8"],
        ["S", "42-44", "28", "19", "8.5"],
        ["M", "44-46", "29", "20", "9"],
        ["L", "46-48", "30", "21", "9.5"],
        ["XL", "48-50", "31", "22", "10"],
        ["XXL", "50-52", "32", "23", "10.5"],
        ["XXXL", "52-54", "33", "24", "11"]
      ]
    }
  };

  const measurementGuide = [
    {
      name: "Chest",
      description: "Measure around the fullest part of your chest, keeping the tape horizontal.",
      image: "📏"
    },
    {
      name: "Length",
      description: "Measure from the highest point of the shoulder to the bottom hem.",
      image: "📐"
    },
    {
      name: "Shoulder",
      description: "Measure from shoulder point to shoulder point across the back.",
      image: "📏"
    },
    {
      name: "Sleeve",
      description: "Measure from the shoulder seam to the end of the sleeve.",
      image: "📐"
    }
  ];

  const fitGuide = [
    {
      fit: "Regular Fit",
      description: "Classic comfortable fit that's not too tight or too loose. Perfect for everyday wear.",
      recommendation: "Order your usual size"
    },
    {
      fit: "Oversized Fit",
      description: "Relaxed, loose fit with dropped shoulders. Trendy streetwear style.",
      recommendation: "Order your usual size for oversized look, or size down for less oversized fit"
    },
    {
      fit: "Slim Fit",
      description: "Closer to body fit with tapered silhouette. More fitted appearance.",
      recommendation: "Order your usual size, or size up if you prefer looser fit"
    }
  ];

  const tips = [
    "Always measure yourself rather than relying on clothing labels",
    "Measure over light clothing or undergarments for accuracy",
    "Keep the measuring tape snug but not tight",
    "Ask someone to help you measure for better accuracy",
    "If you're between sizes, consider the fit you prefer",
    "Check the product description for specific fit information"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Ruler className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Size Guide</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Find your perfect fit with our comprehensive size charts and measurement guide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Category Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Select Product Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="flex items-center gap-2 px-6 py-3"
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Size Chart */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shirt className="h-6 w-6 mr-2" />
                {sizeCharts[selectedCategory as keyof typeof sizeCharts].title}
              </CardTitle>
              <p className="text-gray-600">
                {sizeCharts[selectedCategory as keyof typeof sizeCharts].description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {sizeCharts[selectedCategory as keyof typeof sizeCharts].headers.map((header, index) => (
                        <th key={index} className="border border-gray-300 px-4 py-3 text-left font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeCharts[selectedCategory as keyof typeof sizeCharts].rows.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-4 py-3">
                            {cellIndex === 0 ? (
                              <span className="font-semibold text-blue-600">{cell}</span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                * All measurements are in inches. For centimeters, multiply by 2.54
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How to Measure */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection("how-to-measure")}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="flex items-center">
                  <User className="h-6 w-6 mr-2" />
                  How to Measure Yourself
                </CardTitle>
                {openSections["how-to-measure"] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </CardHeader>
            {openSections["how-to-measure"] && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {measurementGuide.map((guide, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl">{guide.image}</div>
                      <div>
                        <h3 className="font-semibold mb-2">{guide.name}</h3>
                        <p className="text-gray-600 text-sm">{guide.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Fit Guide */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection("fit-guide")}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle>Fit Guide</CardTitle>
                {openSections["fit-guide"] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </CardHeader>
            {openSections["fit-guide"] && (
              <CardContent>
                <div className="space-y-6">
                  {fitGuide.map((fit, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg mb-2">{fit.fit}</h3>
                      <p className="text-gray-600 mb-2">{fit.description}</p>
                      <p className="text-sm text-blue-600 font-medium">
                        <strong>Recommendation:</strong> {fit.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sizing Tips */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection("sizing-tips")}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="flex items-center">
                  <Info className="h-6 w-6 mr-2" />
                  Sizing Tips
                </CardTitle>
                {openSections["sizing-tips"] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </CardHeader>
            {openSections["sizing-tips"] && (
              <CardContent>
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Size Conversion */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>International Size Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">India/US</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">UK</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">EU</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Chest (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold">XS</td>
                      <td className="border border-gray-300 px-4 py-3">6</td>
                      <td className="border border-gray-300 px-4 py-3">32</td>
                      <td className="border border-gray-300 px-4 py-3">34-36</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                      <td className="border border-gray-300 px-4 py-3">8</td>
                      <td className="border border-gray-300 px-4 py-3">34</td>
                      <td className="border border-gray-300 px-4 py-3">36-38</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                      <td className="border border-gray-300 px-4 py-3">10</td>
                      <td className="border border-gray-300 px-4 py-3">36</td>
                      <td className="border border-gray-300 px-4 py-3">38-40</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                      <td className="border border-gray-300 px-4 py-3">12</td>
                      <td className="border border-gray-300 px-4 py-3">38</td>
                      <td className="border border-gray-300 px-4 py-3">40-42</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                      <td className="border border-gray-300 px-4 py-3">14</td>
                      <td className="border border-gray-300 px-4 py-3">40</td>
                      <td className="border border-gray-300 px-4 py-3">42-44</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold">XXL</td>
                      <td className="border border-gray-300 px-4 py-3">16</td>
                      <td className="border border-gray-300 px-4 py-3">42</td>
                      <td className="border border-gray-300 px-4 py-3">44-46</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Still Need Help */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Can't find your size or have questions about fit? Our customer support team 
                is here to help you find the perfect size.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Contact Support
                </Button>
                <Button variant="outline">
                  Live Chat
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Available Monday - Friday, 9 AM - 6 PM IST
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Ruler } from "lucide-react";

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
  productType?: "t-shirt" | "hoodie" | "general";
}

export default function SizeChart({ isOpen, onClose, productType = "t-shirt" }: SizeChartProps) {
  if (!isOpen) return null;

  // Size data for different product types
  const sizeData = {
    "t-shirt": {
      title: "T-Shirt Size Chart",
      description: "All measurements are in inches. For the best fit, measure yourself and compare with the chart below.",
      sizes: [
        { size: "XS", chest: "34-36", length: "26", shoulder: "16" },
        { size: "S", chest: "36-38", length: "27", shoulder: "17" },
        { size: "M", chest: "38-40", length: "28", shoulder: "18" },
        { size: "L", chest: "40-42", length: "29", shoulder: "19" },
        { size: "XL", chest: "42-44", length: "30", shoulder: "20" },
        { size: "XXL", chest: "44-46", length: "31", shoulder: "21" },
        { size: "XXXL", chest: "46-48", length: "32", shoulder: "22" },
      ]
    },
    "hoodie": {
      title: "Hoodie Size Chart",
      description: "All measurements are in inches. Hoodies have a relaxed fit. For the best fit, measure yourself and compare with the chart below.",
      sizes: [
        { size: "XS", chest: "36-38", length: "25", shoulder: "17" },
        { size: "S", chest: "38-40", length: "26", shoulder: "18" },
        { size: "M", chest: "40-42", length: "27", shoulder: "19" },
        { size: "L", chest: "42-44", length: "28", shoulder: "20" },
        { size: "XL", chest: "44-46", length: "29", shoulder: "21" },
        { size: "XXL", chest: "46-48", length: "30", shoulder: "22" },
        { size: "XXXL", chest: "48-50", length: "31", shoulder: "23" },
      ]
    },
    "general": {
      title: "Size Chart",
      description: "All measurements are in inches. For the best fit, measure yourself and compare with the chart below.",
      sizes: [
        { size: "XS", chest: "34-36", length: "26", shoulder: "16" },
        { size: "S", chest: "36-38", length: "27", shoulder: "17" },
        { size: "M", chest: "38-40", length: "28", shoulder: "18" },
        { size: "L", chest: "40-42", length: "29", shoulder: "19" },
        { size: "XL", chest: "42-44", length: "30", shoulder: "20" },
        { size: "XXL", chest: "44-46", length: "31", shoulder: "21" },
        { size: "XXXL", chest: "46-48", length: "32", shoulder: "22" },
      ]
    }
  };

  const currentData = sizeData[productType];

  return (
    <>
      {/* Backdrop — semi-transparent so page content stays visible */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl font-bold">{currentData.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            <p className="text-gray-600 text-sm">
              {currentData.description}
            </p>

            {/* Size Chart Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Size</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Chest (inches)</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Length (inches)</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Shoulder (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.sizes.map((sizeInfo, index) => (
                    <tr key={sizeInfo.size} className={index % 2 === 0 ? "bg-white" : "bg-gray-25"}>
                      <td className="border border-gray-300 px-4 py-3 font-medium">{sizeInfo.size}</td>
                      <td className="border border-gray-300 px-4 py-3">{sizeInfo.chest}</td>
                      <td className="border border-gray-300 px-4 py-3">{sizeInfo.length}</td>
                      <td className="border border-gray-300 px-4 py-3">{sizeInfo.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How to Measure */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">How to Measure:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.
                </div>
                <div>
                  <strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem.
                </div>
                <div>
                  <strong>Shoulder:</strong> Measure from shoulder point to shoulder point across the back.
                </div>
              </div>
            </div>

            {/* Size Recommendations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Size Recommendations:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <strong>For a fitted look:</strong> Choose your exact chest measurement size.
                </div>
                <div>
                  <strong>For a relaxed fit:</strong> Go one size up from your chest measurement.
                </div>
                <div>
                  <strong>For an oversized look:</strong> Go two sizes up from your chest measurement.
                </div>
                <div>
                  <strong>Between sizes?</strong> We recommend sizing up for comfort.
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Care Instructions:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Machine wash cold with like colors</li>
                <li>• Do not bleach or use fabric softener</li>
                <li>• Tumble dry low or hang dry</li>
                <li>• Iron inside out on low heat if needed</li>
                <li>• Do not dry clean</li>
              </ul>
            </div>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={onClose} className="px-8">
                Got it, thanks!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
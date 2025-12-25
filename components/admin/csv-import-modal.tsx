"use client";
import { useState } from "react";
import { ProductCSVService } from "@/lib/inventory-services";
import { AdminProductService } from "@/lib/admin-services";
import { Product } from "@/lib/data";
import { X, Upload, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function CSVImportModal({ isOpen, onClose, onImportComplete }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Omit<Product, 'id' | 'images'>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { addToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = async (file: File) => {
    try {
      const content = await file.text();
      const parsedData = ProductCSVService.parseCSV(content);
      
      // Validate data
      const validationErrors: string[] = [];
      parsedData.forEach((product, index) => {
        if (!product.name) validationErrors.push(`Row ${index + 2}: Name is required`);
        if (!product.price || product.price <= 0) validationErrors.push(`Row ${index + 2}: Valid price is required`);
        if (!product.category) validationErrors.push(`Row ${index + 2}: Category is required`);
        if (!product.sizes || product.sizes.length === 0) validationErrors.push(`Row ${index + 2}: At least one size is required`);
      });

      setErrors(validationErrors);
      setPreviewData(parsedData.slice(0, 5)); // Show first 5 rows for preview
    } catch (error) {
      setErrors(['Failed to parse CSV file. Please check the format.']);
      setPreviewData([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const content = await file.text();
      const parsedData = ProductCSVService.parseCSV(content);

      // Import products
      let successCount = 0;
      let errorCount = 0;

      for (const productData of parsedData) {
        try {
          await AdminProductService.addProduct({
            ...productData,
            images: ["/placeholder.jpg"], // Default placeholder image
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error("Error importing product:", error);
        }
      }

      addToast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} products. ${errorCount} errors.`,
        type: successCount > 0 ? "success" : "error",
      });

      if (successCount > 0) {
        onImportComplete();
        onClose();
      }
    } catch (error) {
      addToast({
        title: "Import Failed",
        description: "Failed to import products. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      name: "Sample Product",
      price: 999,
      category: "T-Shirts",
      description: "Sample product description",
      material: "100% Cotton",
      care: "Machine wash cold",
      origin: "India",
      manufacturer: "Sample Manufacturer",
      sizes: "S;M;L;XL",
      variants: "Black;White;Grey",
      stock: 100,
      lowStockThreshold: 10,
      sku: "SKU001",
      barcode: "1234567890"
    }];

    const csvContent = ProductCSVService.exportToCSV(templateData as any);
    ProductCSVService.downloadCSV(csvContent, 'product-template.csv');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Import Products from CSV
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Need a template?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Download our CSV template to get started with the correct format.
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Click to upload CSV file
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      or drag and drop
                    </span>
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Validation Errors</h4>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Data */}
            {previewData.length > 0 && errors.length === 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Preview (First 5 rows)
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{product.price}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.stock || 0}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.sku || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || errors.length > 0 || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Importing..." : "Import Products"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
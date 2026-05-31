"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { InlineLoader } from "@/components/ui/loader";

export default function ProductsUploadPage() {
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [jsonOutput, setJsonOutput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setProducts([]);
        setJsonOutput("");
      } else {
        addToast({
          type: "error",
          title: "Invalid File",
          description: "Please upload an Excel file (.xlsx or .xls)",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      addToast({
        type: "error",
        title: "No File Selected",
        description: "Please select an Excel file first",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Import xlsx library dynamically
      const XLSX = await import('xlsx');
      
      // Parse Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform data
      const transformedProducts = rawData.map((row: any, index: number) => {
        const sizes = row.sizes 
          ? row.sizes.toString().split(',').map((s: string) => s.trim())
          : ['S', 'M', 'L', 'XL'];
        
        const colors = row.colors 
          ? row.colors.toString().split(',').map((c: string) => c.trim())
          : ['Black', 'White'];
        
        const id = row.id || `custom-${String(index + 1).padStart(3, '0')}`;
        const imageName = row.image || `${id}.svg`;
        const image = imageName.startsWith('/') ? imageName : `/customize-tshirts/${imageName}`;
        
        return {
          id: id,
          name: row.name || 'Unnamed Product',
          price: Number(row.price) || 599,
          category: row.category || 'Customizable T-Shirts',
          image: image,
          description: row.description || 'Premium quality customizable t-shirt',
          material: row.material || '100% Cotton',
          weight: row.weight || '180 GSM',
          sizes: sizes,
          colors: colors,
          printArea: row.printArea || 'Front & Back'
        };
      });
      
      setProducts(transformedProducts);
      setJsonOutput(JSON.stringify(transformedProducts, null, 2));
      
      addToast({
        type: "success",
        title: "Conversion Successful",
        description: `Converted ${transformedProducts.length} products from Excel`,
      });
      
    } catch (error: any) {
      console.error('Conversion error:', error);
      addToast({
        type: "error",
        title: "Conversion Failed",
        description: error.message || "Failed to convert Excel file",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customize-products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addToast({
      type: "success",
      title: "Downloaded",
      description: "JSON file downloaded successfully",
    });
  };

  const handleCopyJSON = () => {
    if (!jsonOutput) return;
    
    navigator.clipboard.writeText(jsonOutput);
    addToast({
      type: "success",
      title: "Copied",
      description: "JSON copied to clipboard",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Products from Excel</h1>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📋 Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the Excel template below</li>
            <li>Fill in your product details in the template</li>
            <li>Upload the completed Excel file</li>
            <li>Click "Convert to JSON"</li>
            <li>Download the JSON file or copy it</li>
            <li>Replace the content in <code className="bg-gray-100 px-2 py-1 rounded">data/customize-products.json</code></li>
          </ol>
          
          <div className="mt-4">
            <a 
              href="/templates/products-template.xlsx" 
              download
              className="text-blue-600 hover:underline"
            >
              📥 Download Excel Template
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📤 Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100
                  cursor-pointer"
              />
            </div>
            
            {file && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Selected file:</strong> {file.name}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
            
            <Button
              onClick={handleConvert}
              disabled={!file || isProcessing}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? "Converting..." : "Convert to JSON"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Loader */}
      {isProcessing && (
        <Card className="mb-6">
          <CardContent className="py-8">
            <InlineLoader text="Converting Excel to JSON..." size="md" />
          </CardContent>
        </Card>
      )}

      {/* Products Preview */}
      {products.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>✅ Converted Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{index + 1}. {product.name}</h3>
                      <p className="text-sm text-gray-600">ID: {product.id}</p>
                      <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
                      <p className="text-sm text-gray-600">
                        Sizes: {product.sizes.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Colors: {product.colors.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.material}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Output */}
      {jsonOutput && (
        <Card>
          <CardHeader>
            <CardTitle>📄 JSON Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadJSON}
                  variant="outline"
                  className="flex-1"
                >
                  📥 Download JSON
                </Button>
                <Button
                  onClick={handleCopyJSON}
                  variant="outline"
                  className="flex-1"
                >
                  📋 Copy to Clipboard
                </Button>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono">{jsonOutput}</pre>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Next Step:</strong> Copy this JSON and replace the content in{' '}
                  <code className="bg-yellow-100 px-2 py-1 rounded">data/customize-products.json</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Excel Format Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📊 Excel Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Column</th>
                  <th className="border px-4 py-2 text-left">Required</th>
                  <th className="border px-4 py-2 text-left">Format</th>
                  <th className="border px-4 py-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">id</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">custom-001</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">name</td>
                  <td className="border px-4 py-2">Required</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">Classic Cotton Tee</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">price</td>
                  <td className="border px-4 py-2">Required</td>
                  <td className="border px-4 py-2">Number</td>
                  <td className="border px-4 py-2">599</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">category</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">Customizable T-Shirts</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">image</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">classic-white.svg</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">description</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">Premium quality t-shirt</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">material</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">100% Cotton</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">weight</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">180 GSM</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">sizes</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Comma-separated</td>
                  <td className="border px-4 py-2">XS, S, M, L, XL</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">colors</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Comma-separated</td>
                  <td className="border px-4 py-2">Black, White, Red</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">printArea</td>
                  <td className="border px-4 py-2">Optional</td>
                  <td className="border px-4 py-2">Text</td>
                  <td className="border px-4 py-2">Front & Back</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

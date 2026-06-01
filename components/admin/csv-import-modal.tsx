"use client";
import { useState, useRef } from "react";
import { ProductCSVService } from "@/lib/inventory-services";
import { AdminProductService } from "@/lib/admin-services";
import { Product } from "@/lib/data";
import { X, Upload, Download, AlertTriangle, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ImportResult = {
  inserted: number;
  updated: number;
  failed: Array<{ index: number; name: string; error: string }>;
};

export default function CSVImportModal({ isOpen, onClose, onImportComplete }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<Omit<Product, "id" | "images">[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const reset = () => {
    setFile(null);
    setPreviewData([]);
    setTotalRows(0);
    setValidationErrors([]);
    setImportResult(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateRows = (rows: Omit<Product, "id" | "images">[]): string[] => {
    const errors: string[] = [];
    rows.forEach((product, index) => {
      const row = index + 2; // +2 because row 1 is header
      if (!product.name?.trim()) errors.push(`Row ${row}: Name is required`);
      if (!product.price || product.price <= 0) errors.push(`Row ${row}: Valid price is required`);
      if (!product.category?.trim()) errors.push(`Row ${row}: Category is required`);
      if (!product.sizes || product.sizes.length === 0) errors.push(`Row ${row}: At least one size is required`);
    });
    return errors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setImportResult(null);
    setFile(selectedFile);

    try {
      const content = await selectedFile.text();
      const parsed = ProductCSVService.parseCSV(content);
      setTotalRows(parsed.length);
      setPreviewData(parsed.slice(0, 5));
      setValidationErrors(validateRows(parsed));
    } catch {
      setValidationErrors(["Failed to parse CSV file. Please check the format."]);
      setPreviewData([]);
      setTotalRows(0);
    }
  };

  const handleImport = async () => {
    if (!file || loading) return;

    setLoading(true);
    setProgress(0);
    setImportResult(null);

    try {
      const content = await file.text();
      const parsed = ProductCSVService.parseCSV(content);

      if (parsed.length === 0) {
        addToast({ title: "Empty File", description: "No data rows found in the CSV.", type: "error" });
        setLoading(false);
        return;
      }

      // Simulate progress while the bulk call runs
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 85 ? prev + 5 : prev));
      }, 300);

      const result = await AdminProductService.bulkImportProducts(
        parsed as Omit<Product, "id">[]
      );

      clearInterval(progressInterval);
      setProgress(100);
      setImportResult(result);

      if (result.inserted > 0 || result.updated > 0) {
        addToast({
          title: "Import Complete",
          description: `${result.inserted} product${result.inserted !== 1 ? "s" : ""} imported successfully.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ""}`,
          type: result.failed.length === 0 ? "success" : "error",
        });
        onImportComplete();
      } else {
        addToast({
          title: "Import Failed",
          description: `All ${result.failed.length} rows failed. Check the errors below.`,
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "Import Failed",
        description: err.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers =
      "id,name,price,category,description,material,care,origin,manufacturer,sizes,variants,stock,low_stock_threshold,sku,barcode";
    const sampleRow =
      ',"Anime Oversized Tee",999,"T-Shirts","Premium quality oversized tee","100% Cotton","Machine wash cold","India","Sample Manufacturer","S;M;L;XL","Black;White;Grey",50,10,"SKU001","1234567890"';
    ProductCSVService.downloadCSV(`${headers}\n${sampleRow}`, "product-template.csv");
  };

  const hasErrors = validationErrors.length > 0;
  const canImport = !!file && !loading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Import Products from CSV</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
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
              <p className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</p>
              <label
                htmlFor="csv-upload"
                className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="mx-auto h-12 w-12 text-blue-500" />
                    <span className="mt-3 block text-sm font-medium text-gray-900">{file.name}</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {totalRows} data row{totalRows !== 1 ? "s" : ""} detected — click to change file
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-3 block text-sm font-medium text-gray-900">Click to upload CSV file</span>
                    <span className="mt-1 block text-sm text-gray-500">or drag and drop</span>
                  </div>
                )}
                <input
                  ref={inputRef}
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Validation Errors */}
            {hasErrors && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">
                      Validation warnings ({validationErrors.length})
                    </h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Rows with errors will be skipped during import.
                    </p>
                    <ul className="mt-2 text-sm text-yellow-800 space-y-1 max-h-32 overflow-y-auto">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Table */}
            {previewData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Preview — first {previewData.length} of {totalRows} row{totalRows !== 1 ? "s" : ""}
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Name", "Price", "Category", "Sizes", "Stock", "SKU"].map(col => (
                          <th
                            key={col}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{product.name || "—"}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{product.price}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.category || "—"}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {product.sizes?.join(", ") || "—"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.stock ?? 0}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{product.sku || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {loading && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing {totalRows} product{totalRows !== 1 ? "s" : ""}…
                  </span>
                  <span className="text-sm font-medium text-gray-700">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Import Result */}
            {importResult && !loading && (
              <div
                className={`rounded-lg p-4 border ${
                  importResult.failed.length === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle
                    className={`h-5 w-5 mt-0.5 shrink-0 ${
                      importResult.failed.length === 0 ? "text-green-600" : "text-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-medium ${
                        importResult.failed.length === 0 ? "text-green-900" : "text-orange-900"
                      }`}
                    >
                      Import complete
                    </h4>
                    <p className="text-sm mt-1 text-gray-700">
                      {importResult.inserted} product{importResult.inserted !== 1 ? "s" : ""} added to database.
                      {importResult.failed.length > 0 &&
                        ` ${importResult.failed.length} row${importResult.failed.length !== 1 ? "s" : ""} failed.`}
                    </p>
                    {importResult.failed.length > 0 && (
                      <ul className="mt-2 text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        {importResult.failed.map((f, i) => (
                          <li key={i}>
                            • Row {f.index} ({f.name || "unnamed"}): {f.error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {importResult ? "Close" : "Cancel"}
              </button>
              {!importResult && (
                <button
                  onClick={handleImport}
                  disabled={!canImport}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import {totalRows > 0 ? `${totalRows} Products` : "Products"}
                    </>
                  )}
                </button>
              )}
              {importResult && importResult.failed.length > 0 && (
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Import Another File
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

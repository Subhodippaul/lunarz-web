"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Truck, Settings } from "lucide-react";
import { getShippingSettings, updateShippingSettings, type ShippingSettings } from "@/lib/shipping-services";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const shippingSettings = await getShippingSettings();
      setSettings(shippingSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load shipping settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateShippingSettings(settings);
      addToast({
        type: "success",
        title: "Settings Saved",
        description: "Shipping settings have been updated successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to save shipping settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ShippingSettings, value: number | boolean) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load settings</p>
        <Button onClick={loadSettings} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                min="0"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleInputChange('freeShippingThreshold', Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Orders above this amount get free shipping
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="standardShippingCharge">Standard Shipping Charge (₹)</Label>
              <Input
                id="standardShippingCharge"
                type="number"
                min="0"
                value={settings.standardShippingCharge}
                onChange={(e) => handleInputChange('standardShippingCharge', Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Shipping charge for online payments
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codShippingCharge">COD Shipping Charge (₹)</Label>
              <Input
                id="codShippingCharge"
                type="number"
                min="0"
                value={settings.codShippingCharge}
                onChange={(e) => handleInputChange('codShippingCharge', Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Additional charge for Cash on Delivery orders
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expressShippingCharge">Express Shipping Charge (₹)</Label>
              <Input
                id="expressShippingCharge"
                type="number"
                min="0"
                value={settings.expressShippingCharge}
                onChange={(e) => handleInputChange('expressShippingCharge', Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Charge for express delivery (1-2 days)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Enable Shipping Settings</Label>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Rules Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Rules Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Free Shipping</h4>
              <p className="text-sm text-blue-700">
                Orders ≥ ₹{settings.freeShippingThreshold.toLocaleString()} get free shipping
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Online Payments</h4>
              <p className="text-sm text-green-700">
                Standard shipping: ₹{settings.standardShippingCharge}
              </p>
              <p className="text-sm text-green-700">
                Express shipping: ₹{settings.expressShippingCharge}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Cash on Delivery (COD)</h4>
              <p className="text-sm text-orange-700">
                COD charge: ₹{settings.codShippingCharge}
              </p>
              <p className="text-sm text-orange-600 mt-2">
                <strong>Note:</strong> COD orders below ₹{settings.freeShippingThreshold} will be charged ₹{settings.codShippingCharge} for shipping.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Example Calculations</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>₹500 order (COD):</span>
                  <span>+₹{settings.codShippingCharge} shipping</span>
                </div>
                <div className="flex justify-between">
                  <span>₹500 order (Online):</span>
                  <span>+₹{settings.standardShippingCharge} shipping</span>
                </div>
                <div className="flex justify-between">
                  <span>₹{settings.freeShippingThreshold}+ order:</span>
                  <span className="text-green-600">Free shipping</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
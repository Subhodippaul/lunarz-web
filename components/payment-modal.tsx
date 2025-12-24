"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { PaymentMethod } from "@/lib/profile-data";
import { PROFILE, CHECKOUT } from "@/lib/constants";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<PaymentMethod, "id">) => void;
  card?: PaymentMethod;
  mode: "add" | "edit";
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  mode 
}: PaymentModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    type: card?.type || "credit" as const,
    cardNumber: card ? `****${card.cardNumber}` : "",
    cardholderName: card?.cardholderName || "",
    expiryMonth: card?.expiryMonth || "",
    expiryYear: card?.expiryYear || "",
    cvv: "",
    isDefault: card?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.cardNumber || !formData.cardholderName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
      addToast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }
    
    // Extract last 4 digits for storage
    const last4 = formData.cardNumber.slice(-4);
    
    onSave({
      type: formData.type,
      cardNumber: last4,
      cardholderName: formData.cardholderName,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      isDefault: formData.isDefault,
    });
    onClose();
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {mode === "add" ? PROFILE.addNewCard : PROFILE.editCard}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Type */}
            <div>
              <Label>Card Type</Label>
              <div className="flex gap-4 mt-2">
                {["credit", "debit"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="rounded"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Card Number */}
            <div>
              <Label htmlFor="cardNumber">{CHECKOUT.cardNumber}</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: formatCardNumber(e.target.value)})}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <Label htmlFor="cardholderName">{CHECKOUT.cardholderName}</Label>
              <Input
                id="cardholderName"
                value={formData.cardholderName}
                onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Month</Label>
                <select
                  id="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({...formData, expiryMonth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <Label htmlFor="expiryYear">Year</Label>
                <select
                  id="expiryYear"
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString().slice(-2);
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* CVV */}
            <div>
              <Label htmlFor="cvv">{CHECKOUT.cvv}</Label>
              <Input
                id="cvv"
                type="password"
                value={formData.cvv}
                onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>

            {/* Default Card */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="isDefault">Set as default payment method</Label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {PROFILE.save}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {PROFILE.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
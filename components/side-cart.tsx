"use client";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function SideCart() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Cart
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        <p className="text-sm text-gray-500">Cart is empty</p>
      </SheetContent>
    </Sheet>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { CART, NAV_LINKS, CURRENCY } from "@/lib/constants";
import Image from "next/image";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } });
    }
  };

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
  <h1 className="text-3xl font-bold mb-4">{CART.pageTitle}</h1>

  <div className="flex justify-center my-6">
    <Image
      src="/empty-cart.png"
      alt="empty cart"
      width={250}
      height={100}
    />
  </div>

  <Alert
    variant="info"
    className="mb-6 flex gap-2 justify-center"
  >
    <AlertIcon variant="info" />
    <AlertDescription className="m-0">
      {CART.emptyCart}. Start shopping to add items to your cart.
    </AlertDescription>
  </Alert>

  <Link href={NAV_LINKS.shop}>
    <Button>{CART.continueShopping}</Button>
  </Link>
</div>

    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{CART.shoppingCart}</h1>
        <Button variant="outline" onClick={clearCart}>
          {CART.clearCart}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg shrink-0">
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                      IMG
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{CURRENCY.symbol}{item.product.price}</p>
                    
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>{CART.size} {item.selectedSize}</span>
                      {item.selectedVariant && <span>{CART.color} {item.selectedVariant}</span>}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {CURRENCY.symbol}{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{CART.orderSummary}</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>{CART.subtotal} ({state.items.reduce((sum, item) => sum + item.quantity, 0)} {CART.items})</span>
                  <span>{CURRENCY.symbol}{state.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{CART.shipping}</span>
                  <span className="text-green-600">{CART.freeShipping}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{CART.total}</span>
                    <span>{CURRENCY.symbol}{state.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mb-3 bg-red-500 hover:bg-red-600"
                onClick={() => router.push(NAV_LINKS.checkout)}
              >
                {CART.proceedToCheckout}
              </Button>
              
              <Link href={NAV_LINKS.shop}>
                <Button variant="outline" className="w-full">
                  {CART.continueShopping}
                </Button>
              </Link>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">{CART.deliveryInfo}</h3>
                <p className="text-sm text-gray-600">
                  {CART.deliveryText}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
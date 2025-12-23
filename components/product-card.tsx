"use client";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS, DEFAULTS, CURRENCY } from "@/lib/constants";

export default function ProductCard({ product }: any) {
  const { state, dispatch } = useCart();

  // Find if this product is already in cart
  const cartItem = state.items.find(
    (item) => item.product.id === product.id && item.selectedSize === DEFAULTS.defaultSize
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        quantity: 1,
        selectedSize: DEFAULTS.defaultSize,
      },
    });
  };

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItem) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id: cartItem.id, quantity: cartItem.quantity + 1 },
      });
    }
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItem) {
      if (cartItem.quantity === 1) {
        dispatch({ type: "REMOVE_ITEM", payload: cartItem.id });
      } else {
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { id: cartItem.id, quantity: cartItem.quantity - 1 },
        });
      }
    }
  };

  return (
    <Card className="rounded-2xl">
      <Link href={`/products/${product.id}`}>
        <CardContent className="p-4 cursor-pointer">
          <div className="h-48 bg-gray-100 rounded-xl mb-4" />
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-600">{CURRENCY.symbol}{product.price}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        {cartItem ? (
          // Show counter when item is in cart
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecreaseQuantity}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="font-medium text-lg px-4">{cartItem.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncreaseQuantity}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          // Show add to cart button when item is not in cart
          <Button className="w-full" onClick={handleAddToCart}>
            {PRODUCTS.addToCart}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@db/schema";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  availableStock: number;
  onAddToCart: (quantity: number) => void;
  cartQuantity: number;
}

export default function ProductCard({ product, availableStock, onAddToCart, cartQuantity }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const remainingStock = availableStock - cartQuantity;

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  return (
    <Card className="overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <span className="text-green-700">₹{formatPrice(product.pricePerDay)}/day</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        <p className="text-sm mb-2">
          Available: <span className={remainingStock > 0 ? "text-green-600" : "text-red-600"}>
            {remainingStock}
          </span>
        </p>
        {cartQuantity > 0 && (
          <p className="text-sm text-blue-600 mb-2">
            In Cart: {cartQuantity}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input
          type="number"
          min="1"
          max={remainingStock}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, remainingStock))}
          className="w-24"
          disabled={remainingStock === 0}
        />
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onAddToCart(quantity)}
          disabled={remainingStock === 0}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
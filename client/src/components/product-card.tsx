import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@db/schema";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  availableStock: number;
  onAddToCart?: (quantity: number) => void;
  cartQuantity?: number;
  showInventoryOnly?: boolean;
}

export default function ProductCard({ product, availableStock, onAddToCart, cartQuantity, showInventoryOnly = true }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const remainingStock = availableStock - (cartQuantity || 0);

  return (
    <Card className="overflow-hidden">
      <img
        src={`/images/${product.imageUrl}`}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        {showInventoryOnly && (
          <>
            {cartQuantity > 0 && (
              <p className="text-sm text-blue-600 mb-2">
                In Cart: {cartQuantity}
              </p>
            )}
            <div className="mt-2">
              <p className="text-sm mb-2">
                Available: <span className={remainingStock > 0 ? "text-green-600" : "text-red-600"}>
                  {remainingStock}
                </span>
              </p>
              <CardFooter className="flex gap-2 px-0">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max={remainingStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const num = val ? Math.min(parseInt(val), remainingStock) : 1;
                    setQuantity(num);
                  }}
                  className="w-24 text-center"
                  disabled={remainingStock === 0}
                />
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onAddToCart && onAddToCart(quantity)}
                  disabled={remainingStock === 0}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
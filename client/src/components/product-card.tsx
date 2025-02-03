import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@db/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <span className="text-green-700">${product.pricePerDay}/day</span>
        </div>
        <p className="text-gray-600 text-sm">{product.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { Product } from "../types/Entities.ts";

export function ProductCard({ product }: { product: Product }) {
  const imageSrc = product.image
    ? `data:image/jpeg;base64,${product.image}`
    : "/placeholder.png";

  return (
    <Card className="h-full bg-card">
      <CardContent className="p-4 flex flex-col gap-3">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-40 w-full object-contain rounded bg-white"
        />

        <div>
          <h3 className="font-semibold hover:text-black text-black">{product.name}</h3>
          <p className="font-bold hover:text-black text-black">${product.price}</p>
          <p className="text-lg hover:text-black text-black">
            Stock: {product.stock}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 mt-auto text-black">
          {Object.entries(product.attributes).map(([key, value]) => (
            <Badge key={key} variant="secondary">
              {key}: {value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

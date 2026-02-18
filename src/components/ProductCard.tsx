import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "../types/Entities.ts";
import type { ReviewResponseDto, ProductRatingDto } from "@/types/Review";

function Stars({ value }: { value: number }) {
  const full = Math.round(value); // o Math.floor si preferís
  return (
      <span className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < full ? "text-orange-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProductCard({
                              product,
                              rating,
                              firstReview,
                            }: {
  product: Product;
  rating?: ProductRatingDto | null;
  firstReview?: ReviewResponseDto | null;
}) {
  const imageSrc = product.image
      ? `data:image/jpeg;base64,${product.image}`
      : "/placeholder.png";

  return (
      <Card className="w-full h-80 bg-white">
        <CardContent className="p-6 h-full flex gap-6">
          <div className="w-1/2 h-full rounded-xl border bg-gray-50 flex items-center justify-center p-4">
            <img
                src={imageSrc}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="w-1/2 h-full flex flex-col justify-between min-w-0">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-black truncate">{product.name}</h3>

              <p className="text-2xl font-semibold text-black">${product.price}</p>

              <p className="text-lg text-gray-600">
                Stock: <span className="font-semibold">{product.stock}</span>
              </p>

              {/* Rating */}
              {rating && (
                  <div className="flex items-center gap-2">
                    <Stars value={rating.avgRating ?? 0} />
                    <span className="text-sm text-gray-600">
                  {Number(rating.avgRating ?? 0).toFixed(1)} ({rating.count ?? 0})
                </span>
                  </div>
              )}

              {firstReview?.message && (
                  <div className="rounded-xl border bg-gray-50 p-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      “{firstReview.message}”
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {firstReview.userName ?? "User"}
                  </span>
                      <span className="text-xs text-gray-500">
                    {firstReview.qualification}/5
                  </span>
                    </div>
                  </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(product.attributes ?? {}).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {key}: {value}
                  </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
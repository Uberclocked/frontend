import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Props } from "./ProductList.types";

function toImgSrc(image: any) {
  if (!image) return null;
  if (typeof image === "string" && image.startsWith("data:")) return image;
  if (typeof image === "string") return `data:image/jpeg;base64,${image}`;
  return null;
}

function ProductList({ products, onSelect }: Props) {
  return (
      <div className="flex flex-col gap-4 border rounded-2xl p-4 overflow-y-auto">
        {products.map((p: any) => {
          const sku = p.skuPrefix ?? p.sku ?? p.id;
          const name = p.name ?? "Unnamed";
          const price = p.price ?? 0;
          const stock = p.stock ?? 0;
          const imgSrc = toImgSrc(p.image);

          return (
              <Card
                  key={sku}
                  className="cursor-pointer hover:bg-muted/40 transition rounded-2xl"
                  onClick={() => onSelect(p)}
              >
                <div className="flex gap-4 p-4">
                  <div className="h-20 w-20 rounded-xl border bg-white flex items-center justify-center p-1">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-xs opacity-60">No image</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <CardHeader className="p-0">
                      <CardTitle className="text-base truncate">{name}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 mt-2 flex items-center justify-between">
                      <p className="font-semibold">${price}</p>

                      <p className="text-sm opacity-80">
                        Stock: <span className={stock > 0 ? "font-semibold" : "font-semibold text-destructive"}>{stock}</span>
                      </p>
                    </CardContent>
                  </div>
                </div>
              </Card>
          );
        })}
      </div>
  );
}

export default ProductList;
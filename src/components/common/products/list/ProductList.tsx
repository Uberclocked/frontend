import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Props } from "./ProductList.types";


function ProductList({ products, onSelect }: Props) {
  return (
    <div
      className="
        flex flex-wrap flex-1
        gap-4 p-4
        border-2 rounded-xl
        overflow-y-scroll
        "
    >
      {products.map((product) => (
        <Card
          key={product.sku}
          className="w-full"
          onClick={() => onSelect(product)}
        >
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>${product.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ProductList;

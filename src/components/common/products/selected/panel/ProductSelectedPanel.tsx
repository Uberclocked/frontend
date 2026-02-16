import { calculateTotalCost } from "./ProductSelectedPanel.utils";
import type { Props } from "./ProductsSelectedPanel.types";


function ProductsSelectedPanel({ selectedProducts }: Props) {
  return (
    <div className="flex flex-col justify-between flex-2 rounded-xl h-full">
      <h1>Items List</h1>
      <div className="overflow-y-scroll">
        {selectedProducts.map((product) => (
          <div className="flex flex-row justify-evenly">
            <p key={`${product.sku}-name`}>{product.name}</p>
            <p key={`${product.sku}-price`}>${product.price}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-row justify-evenly">
        <p>Total price</p>
        <p>${calculateTotalCost(selectedProducts)}</p>
      </div>
    </div>
  )
}

export default ProductsSelectedPanel;

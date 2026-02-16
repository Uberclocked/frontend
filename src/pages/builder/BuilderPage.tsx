import type { Component } from "./types/Component";
import { useEffect, useState } from "react";
import type { Product } from "./types/Product";
import { getProductsByComponentPrefix } from "@/services/Product";
import ComponentSelector from "@/components/common/component/selector/ComponentSelector";
import ProductList from "@/components/common/products/list/ProductList";
import ProductsSelectedPanel from "@/components/common/products/selected/panel/ProductSelectedPanel";
import { useLoaderData } from "react-router-dom";

function BuilderPage() {
  const { components } = useLoaderData() as { components: Component[] }
  const [products, setProducts] = useState([] as Product[]);
  const [selectedProducts, setSelectedProducts] = useState([] as Product[])

  function addSelectedProduct(product: Product) {
    setSelectedProducts([...selectedProducts, product])
  }
  const [selectedComponentSku, setSelectedComponent] = useState("");

  useEffect(() => {
    const fetchProductsByComponent = async () => {
      const data = await getProductsByComponentPrefix(selectedComponentSku);
      setProducts(data);
    };

    fetchProductsByComponent();
  }, [selectedComponentSku])

  return (
    <div className="flex flex-row justify-evenly gap-4 w-full m-4">
      <ComponentSelector components={components} onSelect={setSelectedComponent} />
      <ProductsSelectedPanel selectedProducts={selectedProducts} />
      <ProductList products={products} onSelect={addSelectedProduct} />
    </div >
  )
}

export default BuilderPage;

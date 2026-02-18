import type { CartItem } from "@/types/Entities";


function MyPurchaseItem({ item }: { item: CartItem }) {
  const isCustomPc = item.components && Object.keys(item.components).length > 0;
  const imageSrc = item.image
    ? `data:image/jpeg;base64,${item.image}`
    : isCustomPc
      ? ""
      : "/placeholder.png";

  return (
    <div className="p-3 rounded-xl border flex gap-3">
        <div className="h-16 w-16 rounded-lg border bg-white flex items-center justify-center p-1">
            <img
                src={imageSrc}
                alt={item.productName ?? item.name ?? "Product"}
                className="max-h-full max-w-full object-contain"
            />
        </div>

      <div className="flex-1">
        <p className="font-semibold">{item.name}</p>
        {item.productName && <p className="text-sm">Product: <span>{item.productName}</span></p>}
        <p className="text-sm">Qty: {item.quantity}</p>
        <p className="font-semibold">${Number(item.totalPrice).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default MyPurchaseItem;

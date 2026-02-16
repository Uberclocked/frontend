import type { PurchaseResponseDto } from "@/types/PurchaseDto";
import MyPurchaseItem from "../item/MyPurchasItem";

function MyPurchaseCard({ purchase }: { purchase: PurchaseResponseDto }) {
  return (
    <div className="p-4 rounded-2xl border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-semibold">Purchase #{purchase.id.slice(0, 8)}</p>
          <p className="text-sm">Created: {new Date(purchase.createdAt).toLocaleString()}</p>
          {purchase.pickupDate && (
            <p className="text-sm">Pickup: {new Date(purchase.pickupDate).toLocaleString()}</p>
          )}
        </div>
        <div className="text-right">
          <p>Status: <span className="font-semibold">{purchase.status}</span></p>
          <p className="font-bold text-lg">${Number(purchase.totalAmount).toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="mb-2">
          Items: <span className="font-semibold">{purchase.items?.length ?? 0}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(purchase.items ?? []).map((it) => (
            <MyPurchaseItem key={it.id} item={it} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyPurchaseCard;

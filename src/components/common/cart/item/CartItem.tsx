import type { Props } from "./CartItem.types";

function CartItem({ item, updating, changeQuantityAbs, removeItem, navigate }: Props) {
  const isCustomPc = item.components && Object.keys(item.components).length > 0;
  const imageSrc = item.image ? `data:image/jpeg;base64,${item.image}` : "/placeholder.png";
  const isUpdating = updating[item.id];

  const stock = Number(item.stock ?? 0);
  const outOfStockForMore = stock > 0 ? item.quantity >= stock : false;

  return (
      <div className="flex flex-col justify-between p-4 rounded-2xl border shadow-sm h-full">

        {/* ==== CONTENIDO SUPERIOR ==== */}
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-xl overflow-hidden border flex items-center justify-center bg-white">
            <img
                src={imageSrc}
                alt={item.productName ?? item.name ?? "Product"}
                className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold">{item.name}</h3>

            {item.productName && (
                <p className="text-sm mt-1">
                  Product: <span>{item.productName}</span>
                </p>
            )}

            {typeof item.stock !== "undefined" && (
                <p className="text-sm mt-1 opacity-70">
                  Stock: <span className="font-semibold">{stock}</span>
                </p>
            )}

            {isCustomPc && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="text-sm opacity-80">
                    Custom PC ({Object.keys(item.components).length} components)
                  </div>

                  {/* 🔘 Botón más grisáceo */}
                  <button
                      onClick={() => navigate(`/build/${item.id}`)}
                      className="w-fit px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                  >
                    Modify PC
                  </button>
                </div>
            )}

            {/* ==== CONTROLES DE CANTIDAD ==== */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-sm">Quantity:</span>

              <div className="flex items-center gap-2">
                <button
                    onClick={() => changeQuantityAbs(item.id, item.quantity - 1)}
                    className="h-9 w-9 rounded-xl border"
                    disabled={isUpdating || item.quantity <= 1}
                >
                  −
                </button>

                <div className="min-w-10 text-center font-semibold">
                  {item.quantity}
                </div>

                <button
                    onClick={() => changeQuantityAbs(item.id, item.quantity + 1)}
                    className="h-9 w-9 rounded-xl border disabled:opacity-40"
                    disabled={isUpdating || outOfStockForMore}
                >
                  +
                </button>
              </div>


              <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto px-3 py-2 rounded-xl border transition-colors disabled:opacity-40"
                  disabled={isUpdating}
              >
                Remove
              </button>

              <div className="h-4">
              <span className={`text-xs ${isUpdating ? "opacity-100" : "opacity-0"}`}>
                Updating…
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==== FOOTER ==== */}
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
        <span className="font-semibold text-sm opacity-80">
          Total item
        </span>
          <span className="font-bold text-lg">
          ${Number(item.totalPrice).toFixed(2)}
        </span>
        </div>
      </div>
  );
}

export default CartItem;
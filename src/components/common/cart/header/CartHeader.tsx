import type { Props } from "./CartHeader.types";

function CartHeader({ visibleCount, setVisibleCount, totalItems }: Props) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing <span className="font-semibold">{Math.min(visibleCount, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> items
      </p>
      <div className="flex items-center gap-3">
        <label className="text-gray-300i text-sm">Items to show:</label>
        <select value={visibleCount} onChange={(e) => setVisibleCount(Number(e.target.value))} className="rounded-xl border px-3 py-2">
          {[4, 6, 8, 12, 999].map(n => <option key={n} value={n}>{n === 999 ? "All" : n}</option>)}
        </select>
      </div>
    </div>
  )
}

export default CartHeader;


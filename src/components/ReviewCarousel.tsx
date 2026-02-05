import { useEffect, useMemo, useState } from "react";

import type { ReviewResponseDto } from "../types/Review";

export default function ReviewCarousel({ reviews }: { reviews: ReviewResponseDto[] }) {
  const [index, setIndex] = useState(0);

  const safe = useMemo(() => reviews ?? [], [reviews]);

  useEffect(() => {
    if (safe.length === 0) return;

    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % safe.length);
    }, 3500);

    return () => clearInterval(t);
  }, [safe.length]);

  if (safe.length === 0) {
    return (
      <div className="rounded-2xl border p-4">
        <p>No reviews yet</p>
      </div>
    );
  }

  const r = safe[index];

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{r.userName}</p>
          <p className="text-sm">{new Date(r.createdAt).toLocaleString()}</p>
        </div>

        <div className="font-bold">
          {"★".repeat(r.qualification)}
          <span className="font-normal">
            {" "}
            {"☆".repeat(5 - r.qualification)}
          </span>
        </div>
      </div>

      {r.message && (
        <p className="mt-3 leading-relaxed">
          “{r.message}”
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setIndex((i) => (i - 1 + safe.length) % safe.length)}
          className="px-3 py-2 rounded-xl border"
        >
          Prev
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % safe.length)}
          className="px-3 py-2 rounded-xl border"
        >
          Next
        </button>
      </div>
    </div>
  );
}

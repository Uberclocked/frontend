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
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
                <p className="text-gray-300">No reviews yet</p>
            </div>
        );
    }

    const r = safe[index];

    return (
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-gray-100 font-semibold">{r.userName}</p>
                    <p className="text-gray-400 text-sm">{new Date(r.createdAt).toLocaleString()}</p>
                </div>

                <div className="text-[#FF8000] font-bold">
                    {"★".repeat(r.qualification)}
                    <span className="text-gray-600 font-normal">
            {" "}
                        {"☆".repeat(5 - r.qualification)}
          </span>
                </div>
            </div>

            {r.message && (
                <p className="mt-3 text-gray-200 leading-relaxed">
                    “{r.message}”
                </p>
            )}

            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => setIndex((i) => (i - 1 + safe.length) % safe.length)}
                    className="px-3 py-2 rounded-xl border border-gray-700 text-gray-100 hover:bg-gray-900"
                >
                    Prev
                </button>
                <button
                    onClick={() => setIndex((i) => (i + 1) % safe.length)}
                    className="px-3 py-2 rounded-xl border border-gray-700 text-gray-100 hover:bg-gray-900"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

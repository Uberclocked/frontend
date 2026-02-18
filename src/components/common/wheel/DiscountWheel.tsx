import { useMemo, useRef, useState } from "react";

const SEGMENTS = [
    { label: "5%", color: "#f97316" },   // orange-500
    { label: "10%", color: "#9ca3af" },  // gray-400
    { label: "15%", color: "#f97316" },
    { label: "20%", color: "#9ca3af" },
];

function conicGradient() {
    const n = SEGMENTS.length;
    const step = 100 / n;
    // 0-20-40...
    const stops = SEGMENTS.map((s, i) => {
        const a = i * step;
        const b = (i + 1) * step;
        return `${s.color} ${a}% ${b}%`;
    });
    return `conic-gradient(${stops.join(",")})`;
}

export default function DiscountWheel(props: {
    disabled?: boolean;
    onSpin: () => Promise<{ label: string; discount: number; code?: string }>;
}) {
    const { disabled, onSpin } = props;

    const wheelRef = useRef<HTMLDivElement | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ label: string; discount: number; code?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const bg = useMemo(() => conicGradient(), []);

    const handleSpin = async () => {
        if (disabled || spinning) return;

        setError(null);
        setResult(null);
        setSpinning(true);

        try {
            const prize = await onSpin();

            const el = wheelRef.current;
            if (el) {
                const extraSpins = 7;
                const randomDeg = Math.floor(Math.random() * 360);
                const deg = extraSpins * 360 + randomDeg;

                el.style.transition = "transform 3.2s cubic-bezier(0.15, 0.9, 0.1, 1)";
                el.style.transform = `rotate(${deg}deg)`;
            }

            await new Promise((r) => setTimeout(r, 3300));
            setResult(prize);
        } catch (e: any) {
            setError(String(e?.message ?? e));
        } finally {
            setSpinning(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="relative w-85 h-85 mx-auto">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                        <div className="w-0 h-0 border-l-14 border-r-14 border-b-24 border-l-transparent border-r-transparent border-b-orange-500 drop-shadow" />
                        <div className="absolute left-1/2 -translate-x-1/2 top-4.5 w-3 h-3 rounded-full bg-gray-900 shadow" />
                    </div>
                </div>

                <div className="absolute inset-0 rounded-full bg-gray-900/10 blur-[0.5px]" />
                <div className="absolute inset-2.5 rounded-full bg-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]" />

                <div
                    ref={wheelRef}
                    className="absolute inset-[18px] rounded-full overflow-hidden border-[6px] border-gray-800 shadow-inner"
                    style={{ background: bg }}
                >
                    {/* Gloss / highlight */}
                    <div
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                            background:
                                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%)",
                        }}
                    />

                    <div className="relative w-full h-full">
                        {SEGMENTS.map((s, i) => {
                            const n = SEGMENTS.length;

                            const a = ((i + 0.5) * (2 * Math.PI)) / n - Math.PI / 2;

                            const r = 0.72;

                            const x = 50 + Math.cos(a) * 50 * r;
                            const y = 50 + Math.sin(a) * 50 * r;

                            return (
                                <div
                                    key={s.label}
                                    className="absolute"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                >
                                    <div className="w-14 text-center px-2 py-1 rounded-md bg-white/65 backdrop-blur-sm text-[11px] font-extrabold text-gray-900 shadow-sm truncate">
                                        {s.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-[0_12px_28px_rgba(0,0,0,0.35)] border border-white/10">
                            <span className="text-2xl font-black">%</span>
                        </div>
                    </div>

                    {/* Disabled overlay */}
                    {(disabled || spinning) && (
                        <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />
                    )}
                </div>
            </div>

            <button
                className="mt-8 w-full py-3 rounded-xl bg-orange-500 text-white font-bold tracking-wide shadow hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSpin}
                disabled={disabled || spinning}
            >
                {spinning ? "Spinning…" : "Spin"}
            </button>

            {result && (
                <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="font-bold text-gray-900 text-lg">You won: {result.label}</div>
                    <div className="text-sm text-gray-700 mt-1">Discount: {result.discount}%</div>
                    {result.code && (
                        <div className="text-sm mt-2">
                            Coupon: <span className="font-semibold">{result.code}</span>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 rounded-xl border border-red-400 text-red-700 bg-red-50">
                    {error}
                </div>
            )}
        </div>
    );
}
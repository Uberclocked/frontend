import { useEffect, useState } from "react";

export function useCountdown(initialSeconds: number | null) {
    const [seconds, setSeconds] = useState<number | null>(initialSeconds);

    useEffect(() => {
        setSeconds(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (seconds == null) return;
        if (seconds <= 0) return;

        const id = setInterval(() => {
            setSeconds((s) => (s == null ? s : Math.max(0, s - 1)));
        }, 1000);

        return () => clearInterval(id);
    }, [seconds]);

    const hh = seconds == null ? null : Math.floor(seconds / 3600);
    const mm = seconds == null ? null : Math.floor((seconds % 3600) / 60);
    const ss = seconds == null ? null : seconds % 60;

    const formatted =
        seconds == null
            ? null
            : `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

    return { seconds, formatted };
}

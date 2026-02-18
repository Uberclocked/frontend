export function canSpinTodayLocal(userId: string) {
    const key = `wheel:lastSpin:${userId}`;
    const last = localStorage.getItem(key);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    return last !== todayKey;
}

export function markSpunTodayLocal(userId: string) {
    const key = `wheel:lastSpin:${userId}`;
    const d = new Date();
    const todayKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    localStorage.setItem(key, todayKey);
}

import { getMyPurchases } from "@/services/Purchase";
import type { PurchaseResponseDto } from "@/types/PurchaseDto";
import { useState, useCallback, useEffect } from "react";

export function useMyPurchases(getToken: () => Promise<string>) {
  const [purchases, setPurchases] = useState<PurchaseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getMyPurchases(token);
      setPurchases(data);
    } catch (e) {
      console.error(e);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return { purchases, loading, reload: load };
}

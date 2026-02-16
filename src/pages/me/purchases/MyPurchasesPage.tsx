import { useAuth0 } from "@auth0/auth0-react";

import { useMyPurchases } from "./MyPurchases.hooks";
import MyPurchaseCard from "@/components/common/purchases/card/MyPurchaseCard";


export default function MyPurchasesPage() {
  const { getAccessTokenSilently } = useAuth0();
  const { purchases, loading } = useMyPurchases(getAccessTokenSilently);

  if (loading) {
    return (
      <div className="min-w-screen flex items-center justify-center p-6">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-w-screen p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">My Purchases</h1>

        {purchases.length === 0 ? (
          <p>No purchases yet</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {purchases.map(p => (
              <MyPurchaseCard key={p.id} purchase={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

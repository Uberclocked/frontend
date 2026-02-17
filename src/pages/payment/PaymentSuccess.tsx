import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { purchaseInterestedInfo } from "@/services/Market";

export default function PaymentSuccess() {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    (async () => {
      const raw = sessionStorage.getItem("buyInterestedInfo");
      if (!raw) return;

      const { postId, userId } = JSON.parse(raw);
      const token = await getAccessTokenSilently();

      await purchaseInterestedInfo(token, postId, userId);

      sessionStorage.removeItem("buyInterestedInfo");
    })();
  }, [getAccessTokenSilently]);

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Payment successful ✅</h1>
      </div>
  );
}

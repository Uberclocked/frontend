import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import { purchaseInterestedInfo } from "@/services/Market";

export default function PaymentSuccess() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const raw = sessionStorage.getItem("buyInterestedInfo");
        if (!raw) {
          navigate("/"); // si no hay data, igual volvemos
          return;
        }

        const { postId, userId } = JSON.parse(raw);
        const token = await getAccessTokenSilently();

        await purchaseInterestedInfo(token, postId, userId);

        sessionStorage.removeItem("buyInterestedInfo");

        // 🔥 redirigir a home
        navigate("/", { replace: true });

      } catch (e) {
        console.error(e);
        navigate("/", { replace: true });
      }
    })();
  }, [getAccessTokenSilently, navigate]);

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Payment successful ✅</h1>
        <p className="mt-2 opacity-70">Redirecting...</p>
      </div>
  );
}
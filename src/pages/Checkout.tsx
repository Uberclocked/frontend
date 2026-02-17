import { useAuth0 } from "@auth0/auth0-react";
import { Payment } from "@mercadopago/sdk-react";
import type { IPaymentFormData, IAdditionalCardFormData, IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createPayment, createInterestedInfoPayment } from "@/services/mp";
import type { UUID } from "@/types/Market";

function Checkout() {
  const { getAccessTokenSilently } = useAuth0();
  const { preferenceId } = useParams<{ preferenceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const postId = searchParams.get("postId") as UUID | null;
  const userId = searchParams.get("userId") as UUID | null;

  if (!preferenceId) return null;

  const initialization = {
    amount: 50,
    preferenceId,
  };

  const onSubmit = async (formData: IPaymentFormData, _?: IAdditionalCardFormData | null) => {
    const token = await getAccessTokenSilently();

    try {
      const result =
          mode === "interest" && postId && userId
              ? await createInterestedInfoPayment(token, postId, userId, formData)
              : await createPayment(token, formData);

      switch (result.status) {
        case "APPROVED":
          navigate("/payment/success");
          break;
        case "PENDING":
          navigate("/payment/pending");
          break;
        case "FAILURE":
          navigate("/payment/failure");
          break;
      }
      return result;
    } catch {
      navigate("/payment/failure");
      return;
    }
  };

  const customization: IPaymentBrickCustomization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  };

  return (
      <div className="min-w-[50vw] max-h-[75vh] overflow-scroll">
        <Payment initialization={initialization} customization={customization} onSubmit={onSubmit} />
      </div>
  );
}

export default Checkout;

import { createPayment } from '@/services/mp';
import { useAuth0 } from '@auth0/auth0-react';
import { Payment } from '@mercadopago/sdk-react';
import type { IPaymentFormData, IAdditionalCardFormData, IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { useNavigate, useParams } from 'react-router-dom';

function Checkout() {
  const { getAccessTokenSilently } = useAuth0();
  const { preferenceId } = useParams<{ preferenceId: string }>();
  const navigate = useNavigate();

  if (!preferenceId) return;
  const initialization = {
    amount: 50,
    preferenceId: preferenceId,
  };
  const onSubmit = async (formData: IPaymentFormData, _?: IAdditionalCardFormData | null) => {
    const token = await getAccessTokenSilently();
    try {
      const result = await createPayment(token, formData);
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
    } catch (error) {
      navigate("/payment/failure");
      return;
    }
  }
  const customization: IPaymentBrickCustomization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  };
  return (
    <div className='min-w-[50vw] max-h-[75vh] overflow-scroll'>
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit} />
    </div>
  );
}

export default Checkout;

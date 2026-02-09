import { createPayment } from '@/services/mp';
import { useAuth0 } from '@auth0/auth0-react';
import { Payment } from '@mercadopago/sdk-react';
import type { IPaymentFormData, IAdditionalCardFormData, IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { useParams } from 'react-router-dom';

function Checkout() {
  const { getAccessTokenSilently } = useAuth0();
  const { preferenceId } = useParams<{ preferenceId: string }>();
  if (!preferenceId) return;
  const initialization = {
    amount: 100000,
    preferenceId: preferenceId,
  };
  const onSubmit = async (param: IPaymentFormData, param2?: IAdditionalCardFormData | null) => {
    const token = await getAccessTokenSilently();
    return createPayment(token, param)
  }
  const onError = async (error) => {
    // callback llamado para todos los casos de error de Brick
    console.log(error);
  };
  const onReady = async () => {
    /*
      Callback llamado cuando el Brick está listo.
      Aquí puede ocultar cargamentos de su sitio, por ejemplo.
    */
  };
  const customization: IPaymentBrickCustomization = {
    paymentMethods: {
      ticket: "all",
      creditCard: "all",
      prepaidCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  };
  return (
    <div className='min-w-[50vw] max-h-[75vh] overflow-scroll'>
      <Payment
        initialization={initialization}
        customization={customization}
        onReady={onReady}
        onError={onError}
        onSubmit={onSubmit} />
    </div>
  );
}

export default Checkout;

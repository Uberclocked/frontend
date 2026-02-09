import type { UUID } from "@/types/Market";
import { postWithAuth } from "./api";
import type { IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type";

const BASE_URL = "http://localhost:8080/mp";

export async function generatePreference(token: string) {
  return postWithAuth<{ id: string }, {}>(`${BASE_URL}/preference`, token);
}

export async function createPayment(token: string, formData: IPaymentFormData) {
  return postWithAuth<{ transaction_id: UUID, payment_id: number, status: "APPROVED" | "PENDING" | "FAILURE" }>(`${BASE_URL}/payment`, token, formData.formData)
}

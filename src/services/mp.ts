import type { IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type";

import type { UUID } from "@/types/Market";

import {fetchWithAuth, postWithAuth} from "./api";


const BASE_URL = "http://localhost:8080/mp";

export async function generatePreference(token: string) {
  return postWithAuth<{ id: string }, {}>(`${BASE_URL}/preference`, token);
}

export async function createPayment(token: string, formData: IPaymentFormData) {
  return postWithAuth<{ transaction_id: UUID, payment_id: number, status: "APPROVED" | "PENDING" | "FAILURE" }>(`${BASE_URL}/payment`, token, formData.formData)
}

export async function createInterestedInfoPreference(
    token: string,
    postId: UUID,
    interestedUserId: UUID
) {
    return fetchWithAuth<{ id: string }>(`${BASE_URL}/preference/interested-info`, token, {
        method: "POST",
        body: JSON.stringify({ postId, interestedUserId }),
    });
}

export async function createInterestedInfoPayment(
    token: string,
    postId: UUID,
    interestedUserId: UUID,
    formData: IPaymentFormData
) {
    return postWithAuth<{
        transaction_id: UUID | null;
        payment_id: number;
        status: "APPROVED" | "PENDING" | "FAILURE";
    }>(`${BASE_URL}/payment/interested-info`, token, {
        ...formData.formData,
        postId,
        interestedUserId,
    });
}
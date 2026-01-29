import type {UUID} from "@/types/Market.ts";

export interface UserDataDto {
    id: UUID;
    userName: string;
    email: string;
    country: string;
    cellPhone: string;
}
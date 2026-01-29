export type ReviewResponseDto = {
    id: string;
    skuPrefix: string;
    userId: string;
    userName: string;
    qualification: number;
    message?: string | null;
    createdAt: string;
};

export type CreateReviewDto = {
    skuPrefix: string;
    qualification: number;
    message?: string;
};

export type ModifyReviewDataDto = {
    message?: string;
    qualification?: number;
};

export type ProductRatingDto = {
    avgRating: number;
    count: number;
};
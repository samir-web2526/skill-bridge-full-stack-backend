export type IReviewPayload = {
    rating: number;
    comment?: string;
    bookingId: string;
    tutorId:string
};

export type IReviewUpdatePayload = {
    rating?: number;
    comment?: string;
};
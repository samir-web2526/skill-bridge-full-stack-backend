export type IBookingPayload = {
    tutorId: string;
    date: string;
    startTime: string;
    endTime: string;
};

export type IBookingFilterRequest = {
    searchTerm?: string | undefined;
    status?: string | undefined;
};

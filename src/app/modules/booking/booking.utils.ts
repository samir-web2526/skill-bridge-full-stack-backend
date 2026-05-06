export const WORKING_HOURS = {
    MIN: "06:00",
    MAX: "23:00",
};

export const isValidWorkingTime = (from: string, to: string) => {
    return from >= WORKING_HOURS.MIN && to <= WORKING_HOURS.MAX;
};
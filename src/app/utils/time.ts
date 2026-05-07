export const toMinutes = (t: string) => {
    const [h = 0, m = 0] = (t || "0:0").split(":").map(Number);
    return h * 60 + m;
};
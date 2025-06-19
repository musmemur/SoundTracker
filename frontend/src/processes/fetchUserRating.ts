import {axiosInstance} from "../app/axiosInstance.ts";

export async function fetchUserRating(releaseId: string, userId: string): Promise<number | null> {
    try {
        const response = await axiosInstance.post(`/ReleaseRating/get`, {releaseId, userId}, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        return response.data?.rating || null;
    } catch (error) {
        console.error("Ошибка при выполнении fetchUserRating:", error);
        return null;
    }
}
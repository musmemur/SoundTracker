import {axiosInstance} from "../app/axiosInstance.ts";
import {Release} from "../entities/Release.ts";

export async function searchReleases(queryString: string, page: number): Promise<Release[] | []> {
    try {
        const response = await axiosInstance.get(
            `/Search?query=${queryString}&page=${page}`
        );
        return response.data.albums || [];
    } catch (error) {
        console.error("Ошибка при выполнении searchReleases:", error);
        throw error;
    }
}
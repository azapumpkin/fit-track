const API_URL = import.meta.env.VITE_API_URL ?? "";

export type ExternalFood = {
    externalId: string | null;
    name: string;
    brand: string | null;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

export async function searchFoods(
    query: string,
): Promise<ExternalFood[]> {
    const response = await fetch(
        `${API_URL}/api/foods/search?query=${encodeURIComponent(query)}`,
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Не удалось найти продукты",
        );
    }

    return data;
}

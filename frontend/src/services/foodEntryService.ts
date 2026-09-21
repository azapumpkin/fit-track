import { getToken } from "./authStorage";

const API_URL =
    import.meta.env.VITE_API_URL ?? "";

function getAuthHeaders() {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export type DailySummary = {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

export type FoodEntry = {
    id: number;
    amount: number;
    date: string;
    food: {
        name: string;
    };
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

export type Food = {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

export async function getDailySummary(
    date: string,
): Promise<DailySummary> {
    const response = await fetch(
        `${API_URL}/api/food-entries/summary?date=${date}`,
        {
            headers: getAuthHeaders(),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load daily summary",
        );
    }

    return response.json();
}

export async function getFoodEntries(
    date: string,
): Promise<FoodEntry[]> {
    const response = await fetch(
        `${API_URL}/api/food-entries?date=${date}`,
        {
            headers: getAuthHeaders(),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load food entries",
        );
    }

    return response.json();
}

export async function getFoods(): Promise<
    Food[]
> {
    const response = await fetch(
        `${API_URL}/api/foods`,
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load foods",
        );
    }

    return response.json();
}

export async function createFoodEntry(
    foodId: number,
    amount: number,
    date: string,
) {
    const response = await fetch(
        `${API_URL}/api/food-entries`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                foodId,
                amount,
                date,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to create food entry",
        );
    }

    return response.json();
}

export async function deleteFoodEntry(
    id: number,
) {
    const response = await fetch(
        `${API_URL}/api/food-entries/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to delete food entry",
        );
    }

    return response.json();
}

export async function createFood(
    name: string,
    calories: number,
    protein: number,
    fat: number,
    carbs: number,
    isCustom = true,
) {
    const response = await fetch(
        `${API_URL}/api/foods`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name,
                calories,
                protein,
                fat,
                carbs,
                isCustom,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to create food",
        );
    }

    return response.json();
}

export async function updateFood(
    id: number,
    name: string,
    calories: number,
    protein: number,
    fat: number,
    carbs: number,
) {
    const response = await fetch(
        `${API_URL}/api/foods/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name,
                calories,
                protein,
                fat,
                carbs,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to update food",
        );
    }

    return response.json();
}

export async function deleteFood(
    id: number,
) {
    const response = await fetch(
        `${API_URL}/api/foods/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to delete food",
        );
    }

    return response.json();
}

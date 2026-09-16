import { getToken } from "./authStorage";

const API_URL =
  import.meta.env.VITE_API_URL;

export type User = {
  id: number;
  name: string;
  email: string;

  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  activityLevel: string | null;

  dailyCalories: number | null;
  dailyProtein: number | null;
  dailyFat: number | null;
  dailyCarbs: number | null;

  createdAt: string;
};

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(
    `${API_URL}/api/users/me`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Не удалось загрузить профиль",
    );
  }

  return response.json();
}

export async function updateCurrentUser(
  name: string,
  email: string,
  gender: string | null,
  age: number | null,
  height: number | null,
  weight: number | null,
  goal: string | null,
  activityLevel: string | null,
  dailyCalories: number | null,
  dailyProtein: number | null,
  dailyFat: number | null,
  dailyCarbs: number | null,
): Promise<User> {
  const response = await fetch(
    `${API_URL}/api/users/me`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        email,
        gender,
        age,
        height,
        weight,
        goal,
        activityLevel,
        dailyCalories,
        dailyProtein,
        dailyFat,
        dailyCarbs,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Не удалось обновить профиль",
    );
  }

  return response.json();
}
import { saveToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

export type AuthUser = {
    id: number;
    name: string;
    email: string;
};

export type LoginResponse = {
    token: string;
    user: AuthUser;
};

export async function login(
    email: string,
    password: string,
): Promise<LoginResponse> {
    const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Не удалось войти",
        );
    }

    saveToken(data.token);

    return data;
}

export async function register(
    name: string,
    email: string,
    password: string,
): Promise<AuthUser> {
    const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Не удалось зарегистрироваться",
        );
    }

    return data;
}
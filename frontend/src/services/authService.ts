import { saveToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const REQUEST_TIMEOUT_MS = 15_000;

async function authRequest(
    path: string,
    body: Record<string, string>,
) {
    try {
        return await fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(
                REQUEST_TIMEOUT_MS,
            ),
        });
    } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "TimeoutError"
        ) {
            throw new Error(
                "Сервер не ответил вовремя. Попробуйте ещё раз.",
            );
        }

        throw new Error(
            "Сервер не отвечает. Проверьте соединение и попробуйте ещё раз.",
        );
    }
}

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
    const response = await authRequest(
        "/api/auth/login",
        { email, password },
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
    const response = await authRequest(
        "/api/auth/register",
        { name, email, password },
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

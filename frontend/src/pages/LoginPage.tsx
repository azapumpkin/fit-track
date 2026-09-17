import { useState } from "react";

import {
    login,
    register,
} from "../services/authService";

import "./LoginPage.css";

type LoginPageProps = {
    onLogin: () => void;
};

function LoginPage({
    onLogin,
}: LoginPageProps) {
    const [isRegistering, setIsRegistering] =
        useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (isRegistering && !name.trim()) {
            setError("Введите имя");
            return;
        }

        if (!email.trim()) {
            setError("Введите email");
            return;
        }

        if (!password) {
            setError("Введите пароль");
            return;
        }

        if (isRegistering && password.length < 6) {
            setError(
                "Пароль должен содержать минимум 6 символов",
            );
            return;
        }

        try {
            setError(null);
            setIsLoading(true);

            if (isRegistering) {
                await register(
                    name.trim(),
                    email.trim(),
                    password,
                );

                setIsRegistering(false);
                setName("");
                setPassword("");
                setError(
                    "Аккаунт создан. Теперь войдите.",
                );
            } else {
                await login(
                    email.trim(),
                    password,
                );

                onLogin();
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    isRegistering
                        ? "Не удалось зарегистрироваться"
                        : "Не удалось войти",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }

    function switchMode() {
        setIsRegistering(!isRegistering);
        setError(null);
        setPassword("");
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>FitTrack</h1>

                <h2>
                    {isRegistering
                        ? "Регистрация"
                        : "Вход"}
                </h2>

                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <input
                            type="text"
                            placeholder="Имя"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setError(null);
                            }}
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError(null);
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError(null);
                        }}
                    />

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? isRegistering
                                ? "Создаём аккаунт..."
                                : "Входим..."
                            : isRegistering
                                ? "Создать аккаунт"
                                : "Войти"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={switchMode}
                >
                    {isRegistering
                        ? "Уже есть аккаунт? Войти"
                        : "Нет аккаунта? Создать аккаунт"}
                </button>
            </div>
        </div>
    );
}

export default LoginPage;
import { useState } from "react";
import { login } from "../services/authService";

type LoginPageProps = {
    onLogin: () => void;
};

function LoginPage({
    onLogin,
}: LoginPageProps) {
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

        if (!email.trim()) {
            setError("Введите email");
            return;
        }

        if (!password) {
            setError("Введите пароль");
            return;
        }

        try {
            setError(null);
            setIsLoading(true);

            await login(
                email.trim(),
                password,
            );

            onLogin();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Не удалось войти");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>FitTrack</h1>

                <h2>Вход</h2>

                <form onSubmit={handleSubmit}>
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
                            ? "Входим..."
                            : "Войти"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
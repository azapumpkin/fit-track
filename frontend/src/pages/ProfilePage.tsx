import { useEffect, useState } from "react";

import {
    getCurrentUser,
    updateCurrentUser,
    type User,
} from "../services/userService";

type ProfilePageProps = {
    onUserUpdated: (user: User) => void;
};

function ProfilePage({ onUserUpdated }: ProfilePageProps) {
    const [user, setUser] = useState<User | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [goal, setGoal] = useState("");
    const [activityLevel, setActivityLevel] = useState("");

    const [dailyCalories, setDailyCalories] = useState("");
    const [dailyProtein, setDailyProtein] = useState("");
    const [dailyFat, setDailyFat] = useState("");
    const [dailyCarbs, setDailyCarbs] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        getCurrentUser()
            .then((data) => {
                setUser(data);

                setName(data.name);
                setEmail(data.email);
                setGender(data.gender ?? "");
                setAge(data.age?.toString() ?? "");
                setHeight(data.height?.toString() ?? "");
                setWeight(data.weight?.toString() ?? "");
                setGoal(data.goal ?? "");
                setActivityLevel(data.activityLevel ?? "");

                setDailyCalories(data.dailyCalories?.toString() ?? "");
                setDailyProtein(data.dailyProtein?.toString() ?? "");
                setDailyFat(data.dailyFat?.toString() ?? "");
                setDailyCarbs(data.dailyCarbs?.toString() ?? "");
            })
            .catch(() => {
                setError("Не удалось загрузить профиль");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function getMissingData() {
        const missing: string[] = [];

        if (!gender) {
            missing.push("пол");
        }

        if (!age) {
            missing.push("возраст");
        }

        if (!height) {
            missing.push("рост");
        }

        if (!weight) {
            missing.push("вес");
        }

        if (!goal) {
            missing.push("цель");
        }

        if (!activityLevel) {
            missing.push("уровень активности");
        }

        return missing;
    }

    async function saveProfile() {
        try {
            setError(null);
            setMessage(null);
            setIsSaving(true);

            const updatedUser = await updateCurrentUser(
                name,
                email,
                gender || null,
                age ? Number(age) : null,
                height ? Number(height) : null,
                weight ? Number(weight) : null,
                goal || null,
                activityLevel || null,
                dailyCalories ? Number(dailyCalories) : null,
                dailyProtein ? Number(dailyProtein) : null,
                dailyFat ? Number(dailyFat) : null,
                dailyCarbs ? Number(dailyCarbs) : null,
            );

            setUser(updatedUser);
            onUserUpdated(updatedUser);
            setName(updatedUser.name);
            setEmail(updatedUser.email);
            setGender(updatedUser.gender ?? "");
            setAge(updatedUser.age?.toString() ?? "");
            setHeight(updatedUser.height?.toString() ?? "");
            setWeight(updatedUser.weight?.toString() ?? "");
            setGoal(updatedUser.goal ?? "");
            setActivityLevel(updatedUser.activityLevel ?? "");

            setDailyCalories(
                updatedUser.dailyCalories?.toString() ?? "",
            );

            setDailyProtein(
                updatedUser.dailyProtein?.toString() ?? "",
            );

            setDailyFat(
                updatedUser.dailyFat?.toString() ?? "",
            );

            setDailyCarbs(
                updatedUser.dailyCarbs?.toString() ?? "",
            );

            setMessage("Профиль успешно сохранён");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Не удалось сохранить профиль");
            }
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const missingData = getMissingData();

        if (missingData.length > 0) {
            setShowWarning(true);
            return;
        }

        await saveProfile();
    }

    async function handleSaveWithoutCalculation() {
        setShowWarning(false);
        await saveProfile();
    }

    if (isLoading) {
        return <div>Загрузка профиля...</div>;
    }

    if (!user) {
        return (
            <div className="form-error">
                {error || "Профиль не найден"}
            </div>
        );
    }

    const missingData = getMissingData();

    return (
        <div className="profile-page">
            <h1>Мой профиль</h1>

            <form
                className="profile-form"
                onSubmit={handleSubmit}
            >
                <label>
                    Имя
                    <input
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                    />
                </label>

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                    />
                </label>

                <label>
                    Пол
                    <select
                        value={gender}
                        onChange={(event) =>
                            setGender(event.target.value)
                        }
                    >
                        <option value="">
                            Не указан
                        </option>

                        <option value="female">
                            Женский
                        </option>

                        <option value="male">
                            Мужской
                        </option>
                    </select>
                </label>

                <label>
                    Возраст, лет
                    <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(event) => {
                            setAge(event.target.value);
                        }}
                    />
                </label>

                <label>
                    Рост, см
                    <input
                        type="number"
                        min="1"
                        value={height}
                        onChange={(event) =>
                            setHeight(event.target.value)
                        }
                    />
                </label>

                <label>
                    Вес, кг
                    <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={weight}
                        onChange={(event) =>
                            setWeight(event.target.value)
                        }
                    />
                </label>

                <label>
                    Цель
                    <select
                        value={goal}
                        onChange={(event) =>
                            setGoal(event.target.value)
                        }
                    >
                        <option value="">
                            Не выбрана
                        </option>

                        <option value="lose_weight">
                            Снижение веса
                        </option>

                        <option value="maintain_weight">
                            Поддержание веса
                        </option>

                        <option value="gain_weight">
                            Набор веса
                        </option>
                    </select>
                </label>

                <label>
                    Уровень активности
                    <select
                        value={activityLevel}
                        onChange={(event) =>
                            setActivityLevel(event.target.value)
                        }
                    >
                        <option value="">
                            Не указан
                        </option>

                        <option value="low">
                            Низкая — мало движения
                        </option>

                        <option value="light">
                            Лёгкая — тренировки 1–3 раза в неделю
                        </option>

                        <option value="moderate">
                            Средняя — тренировки 3–5 раз в неделю
                        </option>

                        <option value="high">
                            Высокая — тренировки 6–7 раз в неделю
                        </option>

                        <option value="very_high">
                            Очень высокая — тяжёлая физическая работа
                        </option>
                    </select>
                </label>

                <h2>Дневные нормы</h2>

                <label>
                    Калории, ккал
                    <input
                        type="number"
                        min="1"
                        value={dailyCalories}
                        onChange={(event) =>
                            setDailyCalories(event.target.value)
                        }
                    />
                </label>

                <label>
                    Белки, г
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={dailyProtein}
                        onChange={(event) =>
                            setDailyProtein(event.target.value)
                        }
                    />
                </label>

                <label>
                    Жиры, г
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={dailyFat}
                        onChange={(event) =>
                            setDailyFat(event.target.value)
                        }
                    />
                </label>

                <label>
                    Углеводы, г
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={dailyCarbs}
                        onChange={(event) =>
                            setDailyCarbs(event.target.value)
                        }
                    />
                </label>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="form-success">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSaving}
                >
                    {isSaving
                        ? "Сохраняем..."
                        : "Сохранить изменения"}
                </button>
            </form>

            {showWarning && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>
                            Не хватает данных
                        </h2>

                        <p>
                            Рекомендуемая дневная норма не будет
                            рассчитана автоматически, потому что
                            заполнены не все данные.
                        </p>

                        <p>
                            Не заполнено:
                        </p>

                        <ul>
                            {missingData.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>

                        <p>
                            Вы всё равно можете сохранить профиль
                            и указать КБЖУ вручную.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={handleSaveWithoutCalculation}
                                disabled={isSaving}
                            >
                                Ок
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowWarning(false)
                                }
                                disabled={isSaving}
                            >
                                Внесу все данные
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;
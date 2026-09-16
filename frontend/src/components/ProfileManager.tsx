import { useEffect, useState } from "react";
import {
    createUser,
    deleteUser,
    getUsers,
    updateUser,
    type User,
} from "../services/userService";

type ProfileManagerProps = {
    selectedUserId: number | null;
    onUsersChange: (
        users: User[],
        selectedUserId: number | null,
    ) => void;
};

function ProfileManager({
    selectedUserId,
    onUsersChange,
}: ProfileManagerProps) {
    const [users, setUsers] = useState<User[]>([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [goal, setGoal] = useState("");
    const [dailyCalories, setDailyCalories] =
        useState("");

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const data = await getUsers();

            setUsers(data);

            onUsersChange(
                data,
                selectedUserId ??
                (data.length > 0
                    ? data[0].id
                    : null),
            );
        } catch {
            setError(
                "Не удалось загрузить профили",
            );
        }
    }

    function resetForm() {
        setName("");
        setEmail("");
        setHeight("");
        setWeight("");
        setGoal("");
        setDailyCalories("");
        setEditingId(null);
        setError(null);
    }

    function startEditing(user: User) {
        setEditingId(user.id);
        setName(user.name);
        setEmail(user.email);
        setHeight(
            user.height !== null
                ? String(user.height)
                : "",
        );
        setWeight(
            user.weight !== null
                ? String(user.weight)
                : "",
        );
        setGoal(user.goal ?? "");
        setDailyCalories(
            user.dailyCalories !== null
                ? String(user.dailyCalories)
                : "",
        );
        setError(null);
    }

    async function handleSubmit() {
        if (!name.trim()) {
            setError("Введите имя");
            return;
        }

        if (!email.trim()) {
            setError("Введите email");
            return;
        }

        const heightNumber = height
            ? Number(height)
            : null;

        const weightNumber = weight
            ? Number(weight)
            : null;

        const caloriesNumber = dailyCalories
            ? Number(dailyCalories)
            : null;

        if (
            heightNumber !== null &&
            (!Number.isFinite(heightNumber) ||
                heightNumber <= 0)
        ) {
            setError("Введите корректный рост");
            return;
        }

        if (
            weightNumber !== null &&
            (!Number.isFinite(weightNumber) ||
                weightNumber <= 0)
        ) {
            setError("Введите корректный вес");
            return;
        }

        if (
            caloriesNumber !== null &&
            (!Number.isFinite(caloriesNumber) ||
                caloriesNumber <= 0)
        ) {
            setError(
                "Введите корректную калорийность",
            );
            return;
        }

        try {
            setError(null);

            if (editingId === null) {
                const user = await createUser(
                    name.trim(),
                    email.trim(),
                );

                const updatedUser = await updateUser(
                    user.id,
                    user.name,
                    user.email,
                    heightNumber,
                    weightNumber,
                    goal.trim() || null,
                    caloriesNumber,
                );

                const updatedUsers = [
                    ...users,
                    updatedUser,
                ];

                setUsers(updatedUsers);

                onUsersChange(
                    updatedUsers,
                    updatedUser.id,
                );
            } else {
                const user = await updateUser(
                    editingId,
                    name.trim(),
                    email.trim(),
                    heightNumber,
                    weightNumber,
                    goal.trim() || null,
                    caloriesNumber,
                );

                const updatedUsers = users.map(
                    (currentUser) =>
                        currentUser.id === user.id
                            ? user
                            : currentUser,
                );

                setUsers(updatedUsers);

                onUsersChange(
                    updatedUsers,
                    selectedUserId,
                );
            }

            resetForm();
        } catch {
            setError(
                "Не удалось сохранить профиль",
            );
        }
    }

    async function handleDelete(id: number) {
        const user = users.find(
            (currentUser) =>
                currentUser.id === id,
        );

        if (!user) {
            return;
        }

        const confirmed = window.confirm(
            `Удалить профиль "${user.name}"? Все записи дневника этого профиля тоже будут удалены.`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setError(null);

            await deleteUser(id);

            const updatedUsers = users.filter(
                (currentUser) =>
                    currentUser.id !== id,
            );

            setUsers(updatedUsers);

            let newSelectedUserId =
                selectedUserId;

            if (selectedUserId === id) {
                newSelectedUserId =
                    updatedUsers.length > 0
                        ? updatedUsers[0].id
                        : null;
            }

            onUsersChange(
                updatedUsers,
                newSelectedUserId,
            );

            if (editingId === id) {
                resetForm();
            }
        } catch {
            setError(
                "Не удалось удалить профиль",
            );
        }
    }

    return (
        <div className="profile-manager">
            <h2>
                {editingId === null
                    ? "Создать профиль"
                    : "Редактировать профиль"}
            </h2>

            <div className="profile-manager-form">
                <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        setError(null);
                    }}
                />

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
                    type="number"
                    min="1"
                    placeholder="Рост, см"
                    value={height}
                    onChange={(event) => {
                        setHeight(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="number"
                    min="1"
                    step="0.1"
                    placeholder="Вес, кг"
                    value={weight}
                    onChange={(event) => {
                        setWeight(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="text"
                    placeholder="Цель"
                    value={goal}
                    onChange={(event) => {
                        setGoal(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="number"
                    min="1"
                    placeholder="Дневная норма, ккал"
                    value={dailyCalories}
                    onChange={(event) => {
                        setDailyCalories(
                            event.target.value,
                        );
                        setError(null);
                    }}
                />

                <div className="profile-manager-actions">
                    <button onClick={handleSubmit}>
                        {editingId === null
                            ? "Создать"
                            : "Сохранить"}
                    </button>

                    {editingId !== null && (
                        <button
                            type="button"
                            onClick={resetForm}
                        >
                            Отмена
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            <h2>Профили</h2>

            <div className="profile-manager-list">
                {users.map((user) => (
                    <div
                        className="profile-manager-item"
                        key={user.id}
                    >
                        <div>
                            <strong>{user.name}</strong>

                            <div>{user.email}</div>

                            {user.height !== null && (
                                <div>
                                    Рост: {user.height} см
                                </div>
                            )}

                            {user.weight !== null && (
                                <div>
                                    Вес: {user.weight} кг
                                </div>
                            )}

                            {user.goal && (
                                <div>
                                    Цель: {user.goal}
                                </div>
                            )}

                            {user.dailyCalories !==
                                null && (
                                    <div>
                                        Норма:{" "}
                                        {user.dailyCalories} ккал
                                    </div>
                                )}
                        </div>

                        <div className="profile-manager-item-actions">
                            <button
                                onClick={() =>
                                    startEditing(user)
                                }
                            >
                                Изменить
                            </button>

                            <button
                                onClick={() =>
                                    handleDelete(user.id)
                                }
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfileManager;
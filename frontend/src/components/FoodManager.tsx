import { useEffect, useState } from "react";
import {
    createFood,
    deleteFood,
    getFoods,
    updateFood,
    type Food,
} from "../services/foodEntryService";

function FoodManager() {
    const [foods, setFoods] = useState<Food[]>([]);

    const [name, setName] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [fat, setFat] = useState("");
    const [carbs, setCarbs] = useState("");

    const [editingId, setEditingId] = useState<number | null>(
        null,
    );

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFoods();
    }, []);

    async function loadFoods() {
        try {
            const data = await getFoods();

            setFoods(data);
        } catch {
            setError("Не удалось загрузить продукты");
        }
    }

    function resetForm() {
        setName("");
        setCalories("");
        setProtein("");
        setFat("");
        setCarbs("");
        setEditingId(null);
    }

    function startEditing(food: Food) {
        setEditingId(food.id);
        setName(food.name);
        setCalories(String(food.calories));
        setProtein(String(food.protein));
        setFat(String(food.fat));
        setCarbs(String(food.carbs));
        setError(null);
    }

    async function handleSubmit() {
        const caloriesNumber = Number(calories);
        const proteinNumber = Number(protein);
        const fatNumber = Number(fat);
        const carbsNumber = Number(carbs);

        if (!name.trim()) {
            setError("Введите название продукта");
            return;
        }

        if (
            !Number.isFinite(caloriesNumber) ||
            caloriesNumber < 0
        ) {
            setError("Введите корректное количество калорий");
            return;
        }

        if (
            !Number.isFinite(proteinNumber) ||
            proteinNumber < 0
        ) {
            setError("Введите корректное количество белка");
            return;
        }

        if (
            !Number.isFinite(fatNumber) ||
            fatNumber < 0
        ) {
            setError("Введите корректное количество жиров");
            return;
        }

        if (
            !Number.isFinite(carbsNumber) ||
            carbsNumber < 0
        ) {
            setError("Введите корректное количество углеводов");
            return;
        }

        try {
            setError(null);

            if (editingId === null) {
                const food = await createFood(
                    name.trim(),
                    caloriesNumber,
                    proteinNumber,
                    fatNumber,
                    carbsNumber,
                );

                setFoods((currentFoods) => [
                    ...currentFoods,
                    food,
                ]);
            } else {
                const food = await updateFood(
                    editingId,
                    name.trim(),
                    caloriesNumber,
                    proteinNumber,
                    fatNumber,
                    carbsNumber,
                );

                setFoods((currentFoods) =>
                    currentFoods.map((currentFood) =>
                        currentFood.id === food.id
                            ? food
                            : currentFood,
                    ),
                );
            }

            resetForm();
        } catch {
            setError("Не удалось сохранить продукт");
        }
    }

    async function handleDelete(id: number) {
        const food = foods.find(
            (currentFood) => currentFood.id === id,
        );

        if (!food) {
            return;
        }

        const confirmed = window.confirm(
            `Удалить продукт "${food.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setError(null);

            await deleteFood(id);

            setFoods((currentFoods) =>
                currentFoods.filter(
                    (currentFood) => currentFood.id !== id,
                ),
            );

            if (editingId === id) {
                resetForm();
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Не удалось удалить продукт");
            }
        }
    }

    return (
        <div>
            <h2>
                {editingId === null
                    ? "Добавить продукт"
                    : "Редактировать продукт"}
            </h2>

            <div className="food-manager-form">
                <input
                    type="text"
                    placeholder="Название"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Ккал / 100 г"
                    value={calories}
                    onChange={(event) => {
                        setCalories(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Белки / 100 г"
                    value={protein}
                    onChange={(event) => {
                        setProtein(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Жиры / 100 г"
                    value={fat}
                    onChange={(event) => {
                        setFat(event.target.value);
                        setError(null);
                    }}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Углеводы / 100 г"
                    value={carbs}
                    onChange={(event) => {
                        setCarbs(event.target.value);
                        setError(null);
                    }}
                />

                <div className="food-manager-actions">
                    <button onClick={handleSubmit}>
                        {editingId === null
                            ? "Добавить"
                            : "Сохранить"}
                    </button>

                    {editingId !== null && (
                        <button
                            onClick={resetForm}
                            type="button"
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

            <h2>Справочник продуктов</h2>

            <div className="food-manager-list">
                {foods.map((food) => (
                    <div
                        className="food-manager-item"
                        key={food.id}
                    >
                        <div>
                            <strong>{food.name}</strong>

                            <div>
                                {food.calories} ккал · Б {food.protein} г ·
                                Ж {food.fat} г · У {food.carbs} г
                            </div>
                        </div>

                        <div className="food-manager-item-actions">
                            <button
                                onClick={() => startEditing(food)}
                            >
                                Изменить
                            </button>

                            <button
                                onClick={() => handleDelete(food.id)}
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

export default FoodManager;
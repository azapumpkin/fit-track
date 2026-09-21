import { useEffect, useState } from "react";

import {
    createFood,
    createFoodEntry,
    deleteFood,
    getFoods,
    updateFood,
    type Food,
} from "../services/foodEntryService";

import {
    searchFoods,
    type ExternalFood,
} from "../services/foodService";

import "./FoodManager.css";

type FoodManagerProps = {
    diaryDate: string;
    onAddedToDiary: () => Promise<void>;
};

function FoodManager({
    diaryDate,
    onAddedToDiary,
}: FoodManagerProps) {
    const [foods, setFoods] =
        useState<Food[]>([]);

    const [name, setName] =
        useState("");

    const [calories, setCalories] =
        useState("");

    const [protein, setProtein] =
        useState("");

    const [fat, setFat] =
        useState("");

    const [carbs, setCarbs] =
        useState("");

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [searchQuery, setSearchQuery] =
        useState("");

    const [searchResults, setSearchResults] =
        useState<ExternalFood[]>([]);

    const [isSearching, setIsSearching] =
        useState(false);

    const [selectedFood, setSelectedFood] =
        useState<ExternalFood | null>(null);

    const [amount, setAmount] =
        useState("100");

    const [isAddingToDiary, setIsAddingToDiary] =
        useState(false);

    useEffect(() => {
        loadFoods();
    }, []);

    async function loadFoods() {
        try {
            const data = await getFoods();
            setFoods(data);
        } catch {
            setError(
                "Не удалось загрузить продукты",
            );
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

    async function handleSearch() {
        const query = searchQuery.trim();

        if (!query) {
            setError(
                "Введите название продукта для поиска",
            );
            return;
        }

        try {
            setError(null);
            setIsSearching(true);

            const results =
                await searchFoods(query);

            setSearchResults(results);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Не удалось найти продукты",
                );
            }
        } finally {
            setIsSearching(false);
        }
    }

    function selectExternalFood(
        food: ExternalFood,
    ) {
        setSelectedFood(food);
        setAmount("100");
        setError(null);

        setName(food.name);
        setCalories(String(food.calories));
        setProtein(String(food.protein));
        setFat(String(food.fat));
        setCarbs(String(food.carbs));

        setEditingId(null);
    }

    async function handleAddToDiary() {
        if (!selectedFood) {
            return;
        }

        const amountNumber =
            Number(amount);

        if (
            !Number.isFinite(amountNumber) ||
            amountNumber <= 0
        ) {
            setError(
                "Введите корректное количество граммов",
            );
            return;
        }

        try {
            setError(null);
            setIsAddingToDiary(true);

            // Сначала сохраняем найденный продукт
            // в нашу локальную базу.
            const savedFood =
                await createFood(
                    selectedFood.name,
                    selectedFood.calories,
                    selectedFood.protein,
                    selectedFood.fat,
                    selectedFood.carbs,
                    false,
                );

            // Затем добавляем его в дневник
            // текущего пользователя.
            await createFoodEntry(
                savedFood.id,
                amountNumber,
                diaryDate,
            );

            setSelectedFood(null);
            setAmount("100");

            await loadFoods();
            await onAddedToDiary();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Не удалось добавить продукт в дневник",
                );
            }
        } finally {
            setIsAddingToDiary(false);
        }
    }

    async function handleSubmit() {
        const caloriesNumber =
            Number(calories);

        const proteinNumber =
            Number(protein);

        const fatNumber =
            Number(fat);

        const carbsNumber =
            Number(carbs);

        if (!name.trim()) {
            setError(
                "Введите название продукта",
            );
            return;
        }

        if (
            !Number.isFinite(caloriesNumber) ||
            caloriesNumber < 0
        ) {
            setError(
                "Введите корректное количество калорий",
            );
            return;
        }

        if (
            !Number.isFinite(proteinNumber) ||
            proteinNumber < 0
        ) {
            setError(
                "Введите корректное количество белка",
            );
            return;
        }

        if (
            !Number.isFinite(fatNumber) ||
            fatNumber < 0
        ) {
            setError(
                "Введите корректное количество жиров",
            );
            return;
        }

        if (
            !Number.isFinite(carbsNumber) ||
            carbsNumber < 0
        ) {
            setError(
                "Введите корректное количество углеводов",
            );
            return;
        }

        try {
            setError(null);

            if (editingId === null) {
                const food =
                    await createFood(
                        name.trim(),
                        caloriesNumber,
                        proteinNumber,
                        fatNumber,
                        carbsNumber,
                    );

                setFoods(
                    (currentFoods) => [
                        ...currentFoods,
                        food,
                    ],
                );
            } else {
                const food =
                    await updateFood(
                        editingId,
                        name.trim(),
                        caloriesNumber,
                        proteinNumber,
                        fatNumber,
                        carbsNumber,
                    );

                setFoods(
                    (currentFoods) =>
                        currentFoods.map(
                            (currentFood) =>
                                currentFood.id ===
                                    food.id
                                    ? food
                                    : currentFood,
                        ),
                );
            }

            resetForm();
        } catch {
            setError(
                "Не удалось сохранить продукт",
            );
        }
    }

    async function handleDelete(
        id: number,
    ) {
        const food = foods.find(
            (currentFood) =>
                currentFood.id === id,
        );

        if (!food) {
            return;
        }

        const confirmed =
            window.confirm(
                `Удалить продукт "${food.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setError(null);

            await deleteFood(id);

            setFoods(
                (currentFoods) =>
                    currentFoods.filter(
                        (currentFood) =>
                            currentFood.id !== id,
                    ),
            );

            if (editingId === id) {
                resetForm();
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Не удалось удалить продукт",
                );
            }
        }
    }

    return (
        <div className="food-page">
            <div className="food-page-header">
                <h1>Продукты</h1>

                <p>
                    Найдите продукт и добавьте его
                    в свой рацион
                </p>
            </div>

            <section className="food-search-card">
                <div className="food-search-header">
                    <div>
                        <h2>
                            Поиск продуктов
                        </h2>

                        <p>
                            Поиск по базе Open Food Facts
                        </p>
                    </div>
                </div>

                <div className="food-search-box">
                    <input
                        type="text"
                        placeholder="Например, молоко или яблоко"
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(
                                event.target.value,
                            );

                            setError(null);
                        }}
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                handleSearch();
                            }
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching
                            ? "Ищем..."
                            : "Найти"}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="search-results">
                        <div className="search-results-title">
                            Найдено продуктов:{" "}
                            {searchResults.length}
                        </div>

                        <div className="search-results-list">
                            {searchResults.map(
                                (food, index) => (
                                    <div
                                        className="food-result-card"
                                        key={`${food.externalId}-${index}`}
                                    >
                                        <div className="food-result-info">
                                            <div className="food-result-name">
                                                {food.name}
                                            </div>

                                            {food.brand && (
                                                <div className="food-result-brand">
                                                    {food.brand}
                                                </div>
                                            )}

                                            <div className="food-result-macros">
                                                <span>
                                                    {food.calories.toFixed(
                                                        1,
                                                    )}{" "}
                                                    ккал
                                                </span>

                                                <span>
                                                    Б{" "}
                                                    {food.protein.toFixed(
                                                        1,
                                                    )}{" "}
                                                    г
                                                </span>

                                                <span>
                                                    Ж{" "}
                                                    {food.fat.toFixed(
                                                        1,
                                                    )}{" "}
                                                    г
                                                </span>

                                                <span>
                                                    У{" "}
                                                    {food.carbs.toFixed(
                                                        1,
                                                    )}{" "}
                                                    г
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="food-select-button"
                                            type="button"
                                            onClick={() =>
                                                selectExternalFood(
                                                    food,
                                                )
                                            }
                                        >
                                            Выбрать
                                        </button>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}
            </section>

            {selectedFood && (
                <section className="food-form-card">
                    <div>
                        <h2>
                            Добавить в дневник
                        </h2>

                        <p>
                            {selectedFood.name}
                            {selectedFood.brand
                                ? ` · ${selectedFood.brand}`
                                : ""}
                        </p>
                    </div>

                    <div className="food-form">
                        <label>
                            Количество, г

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={amount}
                                onChange={(event) => {
                                    setAmount(
                                        event.target.value,
                                    );
                                    setError(null);
                                }}
                            />
                        </label>

                        <div className="food-form-actions">
                            <button
                                type="button"
                                onClick={
                                    handleAddToDiary
                                }
                                disabled={
                                    isAddingToDiary
                                }
                            >
                                {isAddingToDiary
                                    ? "Добавляем..."
                                    : "Добавить в дневник"}
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => {
                                    setSelectedFood(
                                        null,
                                    );
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            <section className="food-form-card">
                <div>
                    <h2>
                        {editingId === null
                            ? "Добавить продукт"
                            : "Редактировать продукт"}
                    </h2>

                    <p>
                        Можно выбрать продукт из поиска
                        или добавить его вручную
                    </p>
                </div>

                <div className="food-form">
                    <label>
                        Название

                        <input
                            type="text"
                            value={name}
                            onChange={(event) => {
                                setName(
                                    event.target.value,
                                );
                                setError(null);
                            }}
                        />
                    </label>

                    <label>
                        Калории, ккал / 100 г

                        <input
                            type="number"
                            min="0"
                            value={calories}
                            onChange={(event) => {
                                setCalories(
                                    event.target.value,
                                );
                                setError(null);
                            }}
                        />
                    </label>

                    <label>
                        Белки, г / 100 г

                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={protein}
                            onChange={(event) => {
                                setProtein(
                                    event.target.value,
                                );
                                setError(null);
                            }}
                        />
                    </label>

                    <label>
                        Жиры, г / 100 г

                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={fat}
                            onChange={(event) => {
                                setFat(
                                    event.target.value,
                                );
                                setError(null);
                            }}
                        />
                    </label>

                    <label>
                        Углеводы, г / 100 г

                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={carbs}
                            onChange={(event) => {
                                setCarbs(
                                    event.target.value,
                                );
                                setError(null);
                            }}
                        />
                    </label>

                    <div className="food-form-actions">
                        <button
                            type="button"
                            onClick={handleSubmit}
                        >
                            {editingId === null
                                ? "Добавить продукт"
                                : "Сохранить изменения"}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={resetForm}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="food-list-section">
                <div className="food-list-header">
                    <div>
                        <h2>
                            Мои продукты
                        </h2>

                        <p>
                            Продукты, сохранённые в
                            справочнике FitTrack
                        </p>
                    </div>

                    <span className="food-count">
                        {foods.length}
                    </span>
                </div>

                {foods.length === 0 ? (
                    <div className="empty-foods">
                        Здесь пока нет сохранённых
                        продуктов
                    </div>
                ) : (
                    <div className="food-manager-list">
                        {foods.map((food) => (
                            <div
                                className="food-manager-item"
                                key={food.id}
                            >
                                <div>
                                    <strong>
                                        {food.name}
                                    </strong>

                                    <div>
                                        {food.calories}{" "}
                                        ккал · Б{" "}
                                        {food.protein} г ·
                                        Ж {food.fat} г ·
                                        У {food.carbs} г
                                    </div>
                                </div>

                                <div className="food-manager-item-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            startEditing(
                                                food,
                                            )
                                        }
                                    >
                                        Изменить
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                food.id,
                                            )
                                        }
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default FoodManager;

import { useEffect, useState } from "react";

import "./App.css";

import FoodManager from "./components/FoodManager";

import LoginPage from "./pages/LoginPage";

import ProfilePage from "./pages/ProfilePage";

import {
  getToken,
  removeToken,
} from "./services/authStorage";

import {
  getCurrentUser,
  type User,
} from "./services/userService";

import {
  createFoodEntry,
  deleteFoodEntry,
  getDailySummary,
  getFoodEntries,
  getFoods,
  type DailySummary,
  type Food,
  type FoodEntry,
} from "./services/foodEntryService";

type ActivePage =
  | "diary"
  | "foods"
  | "profile";

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSavedPage(): ActivePage {
  const savedPage =
    localStorage.getItem(
      "fittrack_active_page",
    );

  if (
    savedPage === "foods" ||
    savedPage === "profile"
  ) {
    return savedPage;
  }

  return "diary";
}

function getPercentage(
  current: number,
  goal: number | null,
) {
  if (
    goal === null ||
    goal <= 0
  ) {
    return null;
  }

  return Math.round(
    (current / goal) * 100,
  );
}

type ProgressCardProps = {
  title: string;
  current: number;
  goal: number | null;
  unit: string;
};

function ProgressCard({
  title,
  current,
  goal,
  unit,
}: ProgressCardProps) {
  const percentage = getPercentage(
    current,
    goal,
  );

  const progressWidth =
    percentage === null
      ? 0
      : Math.min(percentage, 100);

  return (
    <div className="progress-card">
      <div className="progress-card-header">
        <strong>
          {title}
        </strong>

        {percentage !== null && (
          <strong>
            {percentage}%
          </strong>
        )}
      </div>

      <div className="progress-card-values">
        <span>
          {current.toFixed(1)} /{" "}
          {goal !== null
            ? goal.toFixed(1)
            : "—"}{" "}
          {unit}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progressWidth}%`,
          }}
        />
      </div>

      {goal === null && (
        <span className="progress-card-hint">
          Норма не указана в профиле
        </span>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState(() => getToken() !== null);

  const [activePage, setActivePage] =
    useState<ActivePage>(
      getSavedPage,
    );

  const [summary, setSummary] =
    useState<DailySummary | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [foodEntries, setFoodEntries] =
    useState<FoodEntry[]>([]);

  const [foods, setFoods] =
    useState<Food[]>([]);

  const [foodId, setFoodId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] =
    useState(getLocalDate());

  useEffect(() => {
    localStorage.setItem(
      "fittrack_active_page",
      activePage,
    );
  }, [activePage]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setSummary(null);
    setError(null);

    getCurrentUser()
      .then(setUser)
      .catch(() => {
        setError(
          "Не удалось загрузить профиль",
        );
      });

    getDailySummary(selectedDate)
      .then(setSummary)
      .catch(() => {
        setError(
          "Не удалось загрузить данные",
        );
      });

    getFoodEntries(selectedDate)
      .then(setFoodEntries)
      .catch(() => {
        setError(
          "Не удалось загрузить продукты",
        );
      });

    getFoods()
      .then(setFoods)
      .catch(() => {
        setError(
          "Не удалось загрузить список продуктов",
        );
      });
  }, [
    isAuthenticated,
    selectedDate,
  ]);

  function handleLogout() {
    removeToken();

    setIsAuthenticated(false);
    setSummary(null);
    setUser(null);
    setFoodEntries([]);

    setActivePage("diary");

    localStorage.setItem(
      "fittrack_active_page",
      "diary",
    );
  }

  async function handleAddFood() {
    const amountNumber = Number(amount);

    if (!foodId) {
      setError("Выберите продукт");
      return;
    }

    if (
      !amount ||
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0
    ) {
      setError(
        "Введите корректное количество",
      );
      return;
    }

    try {
      setError(null);

      await createFoodEntry(
        Number(foodId),
        amountNumber,
        selectedDate,
      );

      const updatedEntries =
        await getFoodEntries(
          selectedDate,
        );

      setFoodEntries(updatedEntries);

      const updatedSummary =
        await getDailySummary(
          selectedDate,
        );

      setSummary(updatedSummary);

      setFoodId("");
      setAmount("");
    } catch {
      setError(
        "Не удалось добавить продукт",
      );
    }
  }

  async function handleDeleteFood(
    id: number,
  ) {
    const entry = foodEntries.find(
      (foodEntry) =>
        foodEntry.id === id,
    );

    if (!entry) {
      return;
    }

    const confirmed = window.confirm(
      `Удалить "${entry.food.name}" — ${entry.amount} г?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteFoodEntry(id);

      const updatedEntries =
        await getFoodEntries(
          selectedDate,
        );

      setFoodEntries(updatedEntries);

      const updatedSummary =
        await getDailySummary(
          selectedDate,
        );

      setSummary(updatedSummary);
    } catch {
      setError(
        "Не удалось удалить продукт",
      );
    }
  }

  async function refreshDiary() {
    const [
      updatedEntries,
      updatedSummary,
      updatedFoods,
    ] = await Promise.all([
      getFoodEntries(selectedDate),
      getDailySummary(selectedDate),
      getFoods(),
    ]);

    setFoodEntries(updatedEntries);
    setSummary(updatedSummary);
    setFoods(updatedFoods);
    setActivePage("diary");
  }

  function changeDate(days: number) {
    const [
      year,
      month,
      day,
    ] = selectedDate
      .split("-")
      .map(Number);

    const currentDate = new Date(
      year,
      month - 1,
      day,
    );

    currentDate.setDate(
      currentDate.getDate() + days,
    );

    const newYear =
      currentDate.getFullYear();

    const newMonth = String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0");

    const newDay = String(
      currentDate.getDate(),
    ).padStart(2, "0");

    setSelectedDate(
      `${newYear}-${newMonth}-${newDay}`,
    );
  }

  function formatDate(date: string) {
    const [
      year,
      month,
      day,
    ] = date.split("-").map(Number);

    return new Date(
      year,
      month - 1,
      day,
    ).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => {
          setIsAuthenticated(true);
          setActivePage("diary");

          localStorage.setItem(
            "fittrack_active_page",
            "diary",
          );
        }}
      />
    );
  }

  return (
    <div className="dashboard">
      <nav className="main-navigation">
        <button
          className={
            activePage === "diary"
              ? "navigation-button active"
              : "navigation-button"
          }
          onClick={() =>
            setActivePage("diary")
          }
        >
          Дневник
        </button>

        <button
          className={
            activePage === "foods"
              ? "navigation-button active"
              : "navigation-button"
          }
          onClick={() =>
            setActivePage("foods")
          }
        >
          Продукты
        </button>

        <button
          className={
            activePage === "profile"
              ? "navigation-button active"
              : "navigation-button"
          }
          onClick={() =>
            setActivePage("profile")
          }
        >
          Профиль
        </button>

        <button
          className="navigation-button"
          onClick={handleLogout}
        >
          Выйти
        </button>
      </nav>

      {activePage === "diary" && (
        <>
          <h1>FitTrack</h1>

          <div className="date-navigation">
            <button
              onClick={() =>
                changeDate(-1)
              }
            >
              ← Предыдущий день
            </button>

            <strong>
              {formatDate(
                selectedDate,
              )}
            </strong>

            <button
              onClick={() =>
                changeDate(1)
              }
            >
              Следующий день →
            </button>
          </div>

          {!summary ? (
            <div>
              Загрузка...
            </div>
          ) : (
            <>
              <h2>
                Итоги за день
              </h2>

              <div className="summary">
                <div className="card">
                  <strong>
                    {summary.calories.toFixed(
                      1,
                    )}
                  </strong>

                  <span>
                    ккал
                  </span>
                </div>

                <div className="card">
                  <strong>
                    {summary.protein.toFixed(
                      1,
                    )}
                  </strong>

                  <span>
                    г белка
                  </span>
                </div>

                <div className="card">
                  <strong>
                    {summary.fat.toFixed(
                      1,
                    )}
                  </strong>

                  <span>
                    г жиров
                  </span>
                </div>

                <div className="card">
                  <strong>
                    {summary.carbs.toFixed(
                      1,
                    )}
                  </strong>

                  <span>
                    г углеводов
                  </span>
                </div>
              </div>

              <h2>
                Дневная норма
              </h2>

              {user && (
                <div className="progress-list">
                  <ProgressCard
                    title="Калории"
                    current={
                      summary.calories
                    }
                    goal={
                      user.dailyCalories
                    }
                    unit="ккал"
                  />

                  <ProgressCard
                    title="Белки"
                    current={
                      summary.protein
                    }
                    goal={
                      user.dailyProtein
                    }
                    unit="г"
                  />

                  <ProgressCard
                    title="Жиры"
                    current={
                      summary.fat
                    }
                    goal={
                      user.dailyFat
                    }
                    unit="г"
                  />

                  <ProgressCard
                    title="Углеводы"
                    current={
                      summary.carbs
                    }
                    goal={
                      user.dailyCarbs
                    }
                    unit="г"
                  />
                </div>
              )}

              <h2>
                Добавить продукт
              </h2>

              <div className="add-food-form">
                <select
                  value={foodId}
                  onChange={(event) => {
                    setFoodId(
                      event.target.value,
                    );
                    setError(null);
                  }}
                >
                  <option value="">
                    Выберите продукт
                  </option>

                  {foods.map((food) => (
                    <option
                      key={food.id}
                      value={food.id}
                    >
                      {food.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Количество, г"
                  value={amount}
                  onChange={(event) => {
                    setAmount(
                      event.target.value,
                    );
                    setError(null);
                  }}
                />

                <button
                  onClick={
                    handleAddFood
                  }
                >
                  Добавить
                </button>
              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <h2>
                Продукты за день
              </h2>

              <div className="food-list">
                {foodEntries.map(
                  (entry) => (
                    <div
                      className="food-item"
                      key={entry.id}
                    >
                      <div>
                        <strong>
                          {
                            entry.food
                              .name
                          }
                        </strong>

                        <div>
                          {entry.amount} г
                        </div>
                      </div>

                      <div className="food-item-right">
                        <span>
                          {entry.calories.toFixed(
                            1,
                          )}{" "}
                          ккал
                        </span>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteFood(
                              entry.id,
                            )
                          }
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </>
      )}

      {activePage === "foods" && (
        <FoodManager
          diaryDate={selectedDate}
          onAddedToDiary={refreshDiary}
        />
      )}

      {activePage === "profile" && (
        <ProfilePage
          onUserUpdated={(updatedUser) => {
            setUser(updatedUser);
          }}
        />
      )}
    </div>
  );
}

export default App;

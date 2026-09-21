import { foodRepository } from "../repositories/foodRepository.js";

const OPEN_FOOD_FACTS_SEARCH_URL =
    "https://search.openfoodfacts.org/search";

const REQUEST_TIMEOUT_MS = 10000;

type OpenFoodFactsProduct = {
    code?: string;

    product_name?: string;

    brands?: string[] | string;

    nutriments?: {
        "energy-kcal_100g"?: number;
        proteins_100g?: number;
        fat_100g?: number;
        carbohydrates_100g?: number;
    };
};

type OpenFoodFactsSearchResponse = {
    hits?: OpenFoodFactsProduct[];
};

const TRANSLATIONS: Record<string, string> = {
    "фундук": "hazelnut",
    "фундучное молоко": "hazelnut milk",
    "миндаль": "almond",
    "миндальное молоко": "almond milk",
    "овсянка": "oat",
    "овсяное молоко": "oat milk",
    "соевое молоко": "soy milk",
    "кокосовое молоко": "coconut milk",
    "рисовое молоко": "rice milk",
    "молоко": "milk",
    "яблоко": "apple",
    "банан": "banana",
    "курица": "chicken",
    "куриная грудка": "chicken breast",
    "говядина": "beef",
    "свинина": "pork",
    "лосось": "salmon",
    "тунец": "tuna",
    "яйцо": "egg",
    "яйца": "eggs",
    "сыр": "cheese",
    "творог": "cottage cheese",
    "йогурт": "yogurt",
    "хлеб": "bread",
    "рис": "rice",
    "макароны": "pasta",
    "картофель": "potato",
};

function translateQuery(
    query: string,
): string | null {
    const normalisedQuery =
        query.trim().toLowerCase();

    return (
        TRANSLATIONS[normalisedQuery] ??
        null
    );
}

async function searchOpenFoodFacts(
    query: string,
) {
    const controller =
        new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(
            OPEN_FOOD_FACTS_SEARCH_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "User-Agent":
                        "FitTrack/1.0 (food database integration)",
                },

                body: JSON.stringify({
                    q: query,
                    page_size: 5,
                    langs: ["en"],
                    fields: [
                        "code",
                        "product_name",
                        "brands",
                        "nutriments",
                    ],
                }),

                signal: controller.signal,
            },
        );

        if (!response.ok) {
            throw new Error(
                `Open Food Facts error: ${response.status}`,
            );
        }

        const data =
            (await response.json()) as OpenFoodFactsSearchResponse;

        return data.hits ?? [];
    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "AbortError"
        ) {
            throw new Error(
                "Поиск продуктов занял слишком много времени",
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

function formatProducts(
    products: OpenFoodFactsProduct[],
) {
    return products
        .filter((product) => {
            const name =
                product.product_name?.trim();

            const calories =
                product.nutriments?.[
                    "energy-kcal_100g"
                ];

            return (
                Boolean(name) &&
                calories !== undefined
            );
        })
        .map((product) => {
            const brand =
                Array.isArray(product.brands)
                    ? product.brands.join(", ")
                    : typeof product.brands ===
                        "string"
                      ? product.brands
                      : null;

            return {
                externalId:
                    product.code ?? null,

                name:
                    product.product_name!.trim(),

                brand,

                calories:
                    product.nutriments?.[
                        "energy-kcal_100g"
                    ] ?? 0,

                protein:
                    product.nutriments?.[
                        "proteins_100g"
                    ] ?? 0,

                fat:
                    product.nutriments?.[
                        "fat_100g"
                    ] ?? 0,

                carbs:
                    product.nutriments?.[
                        "carbohydrates_100g"
                    ] ?? 0,
            };
        });
}

export const foodService = {
    getFoods() {
        return foodRepository.findAll();
    },

    async searchExternalFoods(
        query: string,
    ) {
        const products =
            await searchOpenFoodFacts(query);

        const formattedProducts =
            formatProducts(products);

        const englishQuery =
            translateQuery(query);

        // Если для запроса нет перевода,
        // оставляем обычные результаты.
        if (!englishQuery) {
            return formattedProducts;
        }

        const normalisedQuery =
            query.trim().toLowerCase();

        // Для простых общих запросов вроде
        // "молоко", "яблоко", "рис" второй
        // запрос не нужен.
        const isGenericQuery =
            Object.entries(TRANSLATIONS).some(
                ([russian, english]) =>
                    russian === normalisedQuery &&
                    !english.includes(" "),
            );

        if (isGenericQuery) {
            return formattedProducts;
        }

        // Проверяем, есть ли среди результатов
        // действительно подходящий продукт.
        const englishWords =
            englishQuery
                .toLowerCase()
                .split(/\s+/);

        const hasRelevantResult =
            formattedProducts.some(
                (product) => {
                    const text = [
                        product.name,
                        product.brand ?? "",
                    ]
                        .join(" ")
                        .toLowerCase();

                    return englishWords.every(
                        (word) =>
                            text.includes(word),
                    );
                },
            );

        // Если первоначальный поиск дал
        // подходящий результат — используем его.
        if (hasRelevantResult) {
            return formattedProducts;
        }

        // Если результаты оказались нерелевантными,
        // ищем английский вариант.
        const englishProducts =
            await searchOpenFoodFacts(
                englishQuery,
            );

        const formattedEnglishProducts =
            formatProducts(
                englishProducts,
            );

        // Если английский поиск что-то нашёл,
        // возвращаем его.
        if (
            formattedEnglishProducts.length > 0
        ) {
            return formattedEnglishProducts;
        }

        // Если английский поиск тоже ничего
        // не нашёл, возвращаем первоначальные
        // результаты.
        return formattedProducts;
    },

    createFood(
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
        isCustom = true,
    ) {
        return foodRepository.create(
            name,
            calories,
            protein,
            fat,
            carbs,
            isCustom,
        );
    },

    updateFood(
        id: number,
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
    ) {
        return foodRepository.update(
            id,
            name,
            calories,
            protein,
            fat,
            carbs,
        );
    },

    async deleteFood(id: number) {
        const entriesCount =
            await foodRepository.countFoodEntries(
                id,
            );

        if (entriesCount > 0) {
            throw new Error(
                "Нельзя удалить продукт, который уже используется в дневнике",
            );
        }

        return foodRepository.delete(id);
    },
};

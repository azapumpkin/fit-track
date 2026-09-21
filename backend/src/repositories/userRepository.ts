import { prisma } from "../prisma.js";

function isDroppedConnection(error: unknown) {
  return (
    error instanceof Error &&
    ("code" in error
      ? error.code === "P1017" ||
        error.code === "P1001"
      : error.message.includes(
          "Server has closed the connection",
        ))
  );
}

async function retryDroppedConnection<T>(
  operation: () => Promise<T>,
) {
  try {
    return await operation();
  } catch (error) {
    if (!isDroppedConnection(error)) {
      throw error;
    }

    await prisma.$disconnect();

    return operation();
  }
}

export const userRepository = {
  findAll() {
    return prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  createWithPassword(
    name: string,
    email: string,
    passwordHash: string,
  ) {
    return retryDroppedConnection(() =>
      prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      }),
    );
  },

  update(
    id: number,
    name: string,
    email: string,
    gender: string | null,
    age: number | null,
    height: number | null,
    weight: number | null,
    goal: string | null,
    activityLevel: string | null,
    dailyCalories: number | null,
    dailyProtein: number | null,
    dailyFat: number | null,
    dailyCarbs: number | null,
  ) {
    return prisma.user.update({
      where: {
        id,
      },

      data: {
        name,
        email,
        gender,
        age,
        height,
        weight,
        goal,
        activityLevel,
        dailyCalories,
        dailyProtein,
        dailyFat,
        dailyCarbs,
      },
    });
  },

  delete(id: number) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  },
};

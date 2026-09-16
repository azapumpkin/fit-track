import { prisma } from "../prisma.js";

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
    return prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });
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
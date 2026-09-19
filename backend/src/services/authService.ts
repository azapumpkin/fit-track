import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { userRepository } from "../repositories/userRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "fittrack-secret-key";

export const authService = {
  async register(
    name: string,
    email: string,
    password: string,
  ) {
    const existingUser =
      await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Unique constraint failed");
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    const user =
      await userRepository.createWithPassword(
        name,
        email,
        passwordHash,
      );

    return user;
  },

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await userRepository.findByEmail(email);

    if (!user) {
      throw new Error(
        "Неверный email или пароль",
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new Error(
        "Неверный email или пароль",
      );
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
};
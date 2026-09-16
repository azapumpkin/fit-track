import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

const JWT_SECRET = "fittrack-secret-key";

export const authService = {
  async register(
    name: string,
    email: string,
    password: string,
  ) {
    const passwordHash = await bcrypt.hash(
      password,
      10,
    );

    return userRepository.createWithPassword(
      name,
      email,
      passwordHash,
    );
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

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!isPasswordValid) {
      throw new Error(
        "Неверный email или пароль",
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
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
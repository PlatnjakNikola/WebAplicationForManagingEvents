import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { RegisterInput, LoginInput } from "../validators/auth.schema";
import type { UserResponse, LoginResponse } from "../types/api.types";

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

function toUserResponse(user: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}): UserResponse {
  return {
    id: String(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as "user" | "admin",
  };
}

export async function register(input: RegisterInput): Promise<{ message: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, "CONFLICT", "Email already registered");
  }

  const hashedPassword = await argon2.hash(input.password, ARGON2_OPTIONS);

  await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  });

  return { message: "Registration successful" };
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  const valid = await argon2.verify(user.password, input.password);
  if (!valid) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: "refresh" },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, refreshToken, user: toUserResponse(user) };
}

export async function refresh(
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET);

    if (typeof decoded === "string" || !decoded.sub) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    const userId = Number(decoded.sub);
    const tokenType = (decoded as any).type;

    if (tokenType !== "refresh") {
      throw new AppError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "User not found");
    }

    const newToken = jwt.sign(
      { sub: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { sub: user.id, type: "refresh" },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token");
  }
}

export async function getMe(userId: number): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  return toUserResponse(user);
}

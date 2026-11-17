import prisma from "@/utils/db";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { registrationSchema } from "@/utils/schema";
import { sanitizeInput, commonValidations } from "@/utils/validation";
import { handleApiError, AppError } from "@/utils/errorHandler";

export const POST = async (request: Request) => {
  try {
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "local";

    if (!commonValidations.checkRateLimit(clientIP, 30, 15 * 60 * 1000)) {
      throw new AppError(
        "Too many registration attempts. Please try again later.",
        429
      );
    }

    const body = await sanitizeInput.validateJsonInput(request);
    if (body && typeof body.email === "string") {
      body.email = body.email.replace(/\s+/g, "").toLowerCase();
    }

    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const email = validationResult.data.email.trim().toLowerCase();
    const { password } = validationResult.data;

    // Ensure User table exists even on an uninitialized database
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT,
        "role" TEXT DEFAULT 'user'
      );
    `);

    const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT "id" FROM "User" WHERE lower("email") = ? LIMIT 1`,
      email
    );

    if (existing && existing.length > 0) {
      throw new AppError("Email is already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id: nanoid(),
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: newUser.id,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
};

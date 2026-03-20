import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  verifyAccessToken,
} from '../lib/jwt';
import { createError } from '../middlewares/error.middleware';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(createError('Email already in use', 409));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(createError('Invalid credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return next(createError('Invalid credentials', 401));
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError('Refresh token required', 400));
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      return next(createError('Invalid or expired refresh token', 401));
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });
    const newRefreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(createError('Unauthorized', 401));
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.json({ user });
  } catch {
    next(createError('Unauthorized', 401));
  }
};

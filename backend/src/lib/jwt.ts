import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(process.env.REFRESH_TOKEN_EXPIRY?.replace('d', '') || '7');
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

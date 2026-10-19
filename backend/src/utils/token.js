import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const getCookieOptions = () => {
  const isCloudOrProd = env.NODE_ENV === 'production' || !!process.env.RENDER || process.env.COOKIE_SAMESITE === 'none';
  const sameSite = env.COOKIE_SAMESITE || (isCloudOrProd ? 'none' : 'lax');
  const secure = env.COOKIE_SECURE !== undefined ? env.COOKIE_SECURE : (isCloudOrProd || sameSite === 'none');

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
};

export const setAuthCookie = (res, token) => {
  res.cookie('token', token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    ...getCookieOptions(),
    maxAge: 0
  });
};

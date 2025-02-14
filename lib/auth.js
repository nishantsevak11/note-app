import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, always use environment variable
const TOKEN_EXPIRY = '7d';

export function signJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token) {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export function getAuthToken() {
  return cookies().get('auth_token')?.value;
}

export function removeAuthCookie() {
  cookies().delete('auth_token');
}

export async function getCurrentUser(request) {
  const token = getAuthToken();
  if (!token) return null;

  const decoded = verifyJWT(token);
  if (!decoded) return null;

  return decoded;
}

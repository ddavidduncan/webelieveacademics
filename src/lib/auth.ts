import bcrypt from 'bcryptjs';

export const userRoles = ['student', 'teacher', 'parent', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { generateToken } from '../../middleware/auth';
import type { Register, Login, UpdateProfile } from './auth.schema';

const REFRESH_TOKEN_TTL_DAYS = 7;

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    university: string | null;
    college: string | null;
    semester: number | null;
    profilePicUrl: string | null;
    role: string;
    nameIsPublic: boolean;
    boardTosAccepted: boolean;
  };
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

async function createRefreshToken(userId: string): Promise<string> {
  // Purge old expired tokens for this user first (housekeeping)
  await prisma.refreshToken.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function registerStudent(data: Register): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      university: data.university,
      college: data.college,
      semester: data.semester,
      role: 'STUDENT',
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = await createRefreshToken(user.id);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      college: user.college,
      semester: user.semester,
      profilePicUrl: user.profilePicUrl,
      role: user.role,
      nameIsPublic: user.nameIsPublic,
      boardTosAccepted: user.boardTosAccepted,
    },
  };
}

export async function loginStudent(data: Login): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  const dummyHash = '$2a$12$dummy.hash.for.constant.time.comparison.xxxxxxxxxxx';
  const isValid = user
    ? await bcrypt.compare(data.password, user.passwordHash)
    : await bcrypt.compare(data.password, dummyHash).then(() => false);

  if (!user || !isValid) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Admins cannot log in through the student auth endpoint
  if (user.role === 'ADMIN') {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (user.isBanned) {
    const reason = user.banReason ? ` Reason: ${user.banReason}` : '';
    throw new AppError(
      `Your account has been suspended.${reason}`,
      403,
      'ACCOUNT_BANNED'
    );
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = await createRefreshToken(user.id);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      college: user.college,
      semester: user.semester,
      profilePicUrl: user.profilePicUrl,
      role: user.role,
      nameIsPublic: user.nameIsPublic,
      boardTosAccepted: user.boardTosAccepted,
    },
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> {
  const record = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.refreshToken.delete({ where: { id: record.id } });
    }
    throw new AppError('Refresh token is invalid or expired. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (record.user.isBanned) {
    throw new AppError('Your account has been suspended.', 403, 'ACCOUNT_BANNED');
  }

  // Rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { id: record.id } });

  const newAccessToken = generateToken({
    id: record.user.id,
    email: record.user.email,
    role: record.user.role,
  });
  const newRefreshToken = await createRefreshToken(record.user.id);

  return { token: newAccessToken, refreshToken: newRefreshToken };
}

export async function logoutStudent(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getMe(userId: string): Promise<AuthResponse['user']> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }
  if (user.isBanned) {
    throw new AppError('Your account has been suspended.', 403, 'ACCOUNT_BANNED');
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    university: user.university,
    college: user.college,
    semester: user.semester,
    profilePicUrl: user.profilePicUrl,
    role: user.role,
    nameIsPublic: user.nameIsPublic,
    boardTosAccepted: user.boardTosAccepted,
  };
}

export async function updateProfile(
  userId: string,
  data: UpdateProfile
): Promise<AuthResponse['user']> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.university !== undefined && { university: data.university }),
      ...(data.college !== undefined && { college: data.college }),
      ...(data.semester !== undefined && { semester: data.semester }),
      ...(data.profilePicUrl !== undefined && { profilePicUrl: data.profilePicUrl }),
      ...(data.nameIsPublic !== undefined && { nameIsPublic: data.nameIsPublic }),
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    university: user.university,
    college: user.college,
    semester: user.semester,
    profilePicUrl: user.profilePicUrl,
    role: user.role,
    nameIsPublic: user.nameIsPublic,
    boardTosAccepted: user.boardTosAccepted,
  };
}

export async function acceptBoardTos(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      boardTosAccepted: true,
      boardTosAcceptedAt: new Date(),
    },
  });
}

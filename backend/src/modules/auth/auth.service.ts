import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { generateToken } from '../../middleware/auth';
import type { Register, Login, UpdateProfile } from './auth.schema';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    university: string | null;
    college: string | null;
    semester: number | null;
    profilePicUrl: string | null;
    role: string;
  };
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

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      college: user.college,
      semester: user.semester,
      profilePicUrl: user.profilePicUrl,
      role: user.role,
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

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      college: user.college,
      semester: user.semester,
      profilePicUrl: user.profilePicUrl,
      role: user.role,
    },
  };
}

export async function getMe(userId: string): Promise<AuthResponse['user']> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
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
  };
}

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { AppError } from '../../middleware/errorHandler';
import { generateUploadPresignedUrl } from '../../utils/s3Presign';
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  ProfilePicUploadSchema,
  RefreshTokenSchema,
} from './auth.schema';
import {
  registerStudent,
  loginStudent,
  refreshAccessToken,
  logoutStudent,
  getMe,
  updateProfile,
  acceptBoardTos,
} from './auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = RegisterSchema.parse(req.body);
    const result = await registerStudent(data);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = LoginSchema.parse(req.body);
    const result = await loginStudent(data);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const user = await getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function patchProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const data = UpdateProfileSchema.parse(req.body);
    const user = await updateProfile(req.user.id, data);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken: rt } = RefreshTokenSchema.parse(req.body);
    const result = await refreshAccessToken(rt);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken: rt } = RefreshTokenSchema.parse(req.body);
    await logoutStudent(rt);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function postAcceptBoardTos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    await acceptBoardTos(req.user.id);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function requestProfilePicUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const { fileName, contentType } = ProfilePicUploadSchema.parse(req.body);
    const ext = path.extname(fileName).toLowerCase() || '.jpg';
    const key = `avatars/${req.user.id}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const { uploadUrl, fileUrl } = await generateUploadPresignedUrl(key, contentType);
    res.status(200).json({ success: true, data: { uploadUrl, fileUrl } });
  } catch (err) {
    next(err);
  }
}

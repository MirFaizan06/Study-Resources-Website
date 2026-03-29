import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { generateToken } from '../../middleware/auth';
import { generateUploadPresignedUrl } from '../../utils/s3Presign';
import {
  getDashboardStats,
  getPendingContributions,
  approveContribution,
  rejectContribution,
  adminUploadResource,
  getModerationPosts,
  setPostStatus,
  getModerationComments,
  setCommentStatus,
  getBoardStats,
  listUsers,
  banUser,
  unbanUser,
} from './admin.service';
import { CreateResourceSchema, RequestUploadUrlSchema } from '../resources/resources.schema';
import crypto from 'crypto';
import path from 'path';

// ─── Login Schema ────────────────────────────────────────────────────────────
const AdminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Login ───────────────────────────────────────────────────────────────────
export async function adminLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = AdminLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Use constant-time comparison to prevent timing attacks
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxxxxx';
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isValid || user.role !== 'ADMIN') {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboard(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

// ─── Pending Contributions ────────────────────────────────────────────────────
export async function getPendingContributionsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contributions = await getPendingContributions();
    res.status(200).json({ success: true, data: contributions });
  } catch (err) {
    next(err);
  }
}

// ─── Approve Contribution ────────────────────────────────────────────────────
export async function approveContributionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    if (!id) throw new AppError('Contribution id is required.', 400, 'VALIDATION_ERROR');
    const resource = await approveContribution(id);
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

// ─── Reject / Delete Contribution ────────────────────────────────────────────
export async function rejectContributionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    if (!id) throw new AppError('Contribution id is required.', 400, 'VALIDATION_ERROR');
    await rejectContribution(id);
    res.status(200).json({ success: true, message: 'Contribution rejected and removed.' });
  } catch (err) {
    next(err);
  }
}

// ─── Admin Upload Presigned URL ────────────────────────────────────────────────
export async function adminRequestUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fileName, contentType } = RequestUploadUrlSchema.parse(req.body);
    const ext = path.extname(fileName).toLowerCase() || '.pdf';
    const uniqueKey = `resources/admin/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const { uploadUrl, fileUrl } = await generateUploadPresignedUrl(uniqueKey, contentType);
    res.status(200).json({
      success: true,
      data: { uploadUrl, fileUrl, key: uniqueKey },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Board Moderation ─────────────────────────────────────────────────────────
export async function getModerationPostsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
    const posts = await getModerationPosts(status);
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
}

export async function setPostStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    const { status } = req.body as { status?: string };
    if (!id) throw new AppError('Post id required.', 400, 'VALIDATION_ERROR');
    if (status !== 'ACTIVE' && status !== 'REMOVED' && status !== 'PENDING_REVIEW') {
      throw new AppError('status must be ACTIVE, REMOVED, or PENDING_REVIEW.', 400, 'VALIDATION_ERROR');
    }
    const post = await setPostStatus(id, status);
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function getModerationCommentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
    const comments = await getModerationComments(status);
    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
}

export async function setCommentStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    const { status } = req.body as { status?: string };
    if (!id) throw new AppError('Comment id required.', 400, 'VALIDATION_ERROR');
    if (status !== 'ACTIVE' && status !== 'REMOVED') {
      throw new AppError('status must be ACTIVE or REMOVED.', 400, 'VALIDATION_ERROR');
    }
    const comment = await setCommentStatus(id, status);
    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

export async function getBoardStatsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getBoardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

// ─── User Management ──────────────────────────────────────────────────────────
export async function listUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(String(req.query['page'] ?? '1'), 10);
    const limit = parseInt(String(req.query['limit'] ?? '50'), 10);
    const result = await listUsers(page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function banUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    if (!id) throw new AppError('User id required.', 400, 'VALIDATION_ERROR');
    const { reason } = req.body as { reason?: string };
    const user = await banUser(id, reason);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function unbanUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    if (!id) throw new AppError('User id required.', 400, 'VALIDATION_ERROR');
    const user = await unbanUser(id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Admin Create Resource ────────────────────────────────────────────────────
export async function adminCreateResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    }
    const body = req.body as { fileUrl?: unknown } & Record<string, unknown>;
    if (!body.fileUrl || typeof body.fileUrl !== 'string') {
      throw new AppError('fileUrl is required in the request body.', 400, 'VALIDATION_ERROR');
    }
    const data = CreateResourceSchema.parse(body);
    const resource = await adminUploadResource(data, req.user.id, body.fileUrl);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

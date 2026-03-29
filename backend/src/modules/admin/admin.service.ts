import { Resource } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateResource } from '../resources/resources.schema';

export interface DashboardStats {
  totalResources: number;
  totalDownloads: number;
  pendingContributions: number;
  openRequests: number;
  totalInstitutions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalResources,
    downloadsAggregate,
    pendingContributions,
    openRequests,
    totalInstitutions,
  ] = await Promise.all([
    prisma.resource.count({ where: { isApproved: true } }),
    prisma.resource.aggregate({
      _sum: { downloadsCount: true },
      where: { isApproved: true },
    }),
    prisma.resource.count({ where: { isApproved: false } }),
    prisma.request.count({ where: { status: 'PENDING' } }),
    prisma.institution.count(),
  ]);

  return {
    totalResources,
    totalDownloads: downloadsAggregate._sum.downloadsCount ?? 0,
    pendingContributions,
    openRequests,
    totalInstitutions,
  };
}

export async function getPendingContributions(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: { isApproved: false },
    include: {
      subject: {
        include: {
          program: {
            include: { institution: true },
          },
        },
      },
      uploader: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function approveContribution(id: string): Promise<Resource> {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    throw new AppError(`Contribution with id '${id}' not found.`, 404, 'NOT_FOUND');
  }
  if (resource.isApproved) {
    throw new AppError('This contribution is already approved.', 400, 'ALREADY_APPROVED');
  }

  return prisma.resource.update({
    where: { id },
    data: { isApproved: true },
    include: {
      subject: {
        include: {
          program: {
            include: { institution: true },
          },
        },
      },
    },
  });
}

export async function rejectContribution(id: string): Promise<void> {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    throw new AppError(`Contribution with id '${id}' not found.`, 404, 'NOT_FOUND');
  }
  await prisma.resource.delete({ where: { id } });
}

// ─── Board Moderation ─────────────────────────────────────────────────────────

export async function getModerationPosts(status?: string) {
  const where = status === 'REMOVED'
    ? { status: 'REMOVED' as const }
    : status === 'ACTIVE'
    ? { status: 'ACTIVE' as const }
    : status === 'PENDING_REVIEW'
    ? { status: 'PENDING_REVIEW' as const }
    : {};

  return prisma.concernPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      author: { select: { id: true, name: true, email: true, university: true } },
      _count: { select: { comments: true, votes: true } },
    },
  });
}

export async function setPostStatus(id: string, status: 'ACTIVE' | 'REMOVED' | 'PENDING_REVIEW') {
  const post = await prisma.concernPost.findUnique({ where: { id } });
  if (!post) throw new AppError(`Post '${id}' not found.`, 404, 'NOT_FOUND');
  return prisma.concernPost.update({ where: { id }, data: { status } });
}

export async function getModerationComments(status?: string) {
  const where = status === 'REMOVED'
    ? { status: 'REMOVED' as const }
    : status === 'ACTIVE'
    ? { status: 'ACTIVE' as const }
    : {};

  return prisma.concernComment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      author: { select: { id: true, name: true, email: true } },
      post: { select: { id: true, title: true } },
    },
  });
}

export async function setCommentStatus(id: string, status: 'ACTIVE' | 'REMOVED') {
  const comment = await prisma.concernComment.findUnique({ where: { id } });
  if (!comment) throw new AppError(`Comment '${id}' not found.`, 404, 'NOT_FOUND');
  return prisma.concernComment.update({ where: { id }, data: { status } });
}

export async function getBoardStats() {
  const [totalPosts, totalComments, removedPosts] = await Promise.all([
    prisma.concernPost.count({ where: { status: 'ACTIVE' } }),
    prisma.concernComment.count({ where: { status: 'ACTIVE' } }),
    prisma.concernPost.count({ where: { status: 'REMOVED' } }),
  ]);
  return { totalPosts, totalComments, removedPosts };
}

// ─── User Management ──────────────────────────────────────────────────────────

export async function listUsers(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        university: true,
        college: true,
        isBanned: true,
        banReason: true,
        boardTosAccepted: true,
        createdAt: true,
        _count: {
          select: {
            concernPosts: true,
            resources: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);
  return { users, total, page, limit };
}

export async function banUser(id: string, reason?: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(`User '${id}' not found.`, 404, 'NOT_FOUND');
  if (user.role === 'ADMIN') throw new AppError('Cannot ban an admin account.', 403, 'FORBIDDEN');
  // Revoke all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId: id } });
  return prisma.user.update({
    where: { id },
    data: { isBanned: true, banReason: reason ?? null },
    select: { id: true, email: true, name: true, isBanned: true, banReason: true },
  });
}

export async function unbanUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(`User '${id}' not found.`, 404, 'NOT_FOUND');
  return prisma.user.update({
    where: { id },
    data: { isBanned: false, banReason: null },
    select: { id: true, email: true, name: true, isBanned: true, banReason: true },
  });
}

export async function adminUploadResource(
  data: CreateResource,
  uploaderId: string,
  fileUrl: string
): Promise<Resource> {
  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) {
    throw new AppError(`Subject with id '${data.subjectId}' not found.`, 404, 'NOT_FOUND');
  }

  return prisma.resource.create({
    data: {
      title: data.title,
      type: data.type,
      fileUrl,
      subjectId: data.subjectId,
      uploaderId,
      year: data.year ?? null,
      isAiGenerated: data.isAiGenerated ?? false,
      isApproved: true,
    },
    include: {
      subject: {
        include: {
          program: {
            include: { institution: true },
          },
        },
      },
    },
  });
}

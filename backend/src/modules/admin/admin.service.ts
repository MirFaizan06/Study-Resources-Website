import { Resource } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') throw new AppError('Cannot ban an admin account. Use revoke instead.', 403, 'FORBIDDEN');
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

// ─── Admin Management (Super Admin only) ─────────────────────────────────────

const ADJECTIVES = [
  'scholarly', 'academic', 'diligent', 'curious', 'studious', 'learned', 'gifted', 'astute',
  'earnest', 'thorough', 'ardent', 'devoted', 'focused', 'precise', 'critical', 'analytical',
  'inquisitive', 'insightful', 'fluent', 'proficient', 'logical', 'methodical', 'rigorous',
  'exemplary', 'dedicated', 'attentive', 'disciplined', 'perceptive', 'reflective', 'motivated',
  'ambitious', 'industrious', 'tenacious', 'versatile', 'articulate', 'intellectual', 'inventive',
  'resourceful', 'systematic', 'pragmatic', 'coherent', 'enlightened', 'visionary', 'literate',
  'cerebral', 'erudite', 'discerning', 'rational', 'resolute', 'luminous', 'thoughtful',
  'creative', 'capable', 'competent', 'patient', 'principled', 'incisive', 'meticulous',
  'perspicacious', 'eloquent', 'distinguished', 'accomplished', 'cultivated', 'bookish',
];
const NOUNS = [
  'scholar', 'thesis', 'lecture', 'campus', 'library', 'syllabus', 'chapter', 'faculty',
  'mentor', 'textbook', 'journal', 'curriculum', 'notation', 'formula', 'theorem', 'module',
  'portfolio', 'citation', 'archive', 'discourse', 'annotation', 'diagram', 'concept', 'theory',
  'principle', 'inquiry', 'research', 'codex', 'compendium', 'lexicon', 'treatise', 'appendix',
  'rubric', 'hypothesis', 'inference', 'experiment', 'analysis', 'synthesis', 'critique',
  'perspective', 'paradigm', 'monograph', 'seminar', 'pedagogy', 'manuscript', 'notebook',
  'academy', 'institute', 'seminar', 'degree', 'axiom', 'abstract', 'index', 'roster',
  'register', 'catalogue', 'reference', 'volume', 'edition', 'outline', 'glossary', 'addendum',
  'epistle', 'primer', 'anthology', 'chronicle', 'symposium', 'protocol', 'criterion',
];

function generateAdminEmail(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = String(Math.floor(Math.random() * 90) + 10);
  return `${adj}.${noun}${num}@unit.edu`;
}

function generateAdminPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digits + special;
  // Ensure at least one from each group
  const pick = (s: string) => s[crypto.randomInt(s.length)];
  const base = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 12; i++) base.push(pick(all));
  // Shuffle
  for (let i = base.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join('');
}

export interface CreateAdminData {
  email: string;
  name: string;
  password: string;
  university: string;
  program: string;
  contactNo?: string;
  pfpUrl?: string;
}

export async function createAdmin(data: CreateAdminData) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('An account with this email already exists.', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: 'ADMIN',
      passwordHash,
    },
  });

  const profile = await prisma.adminProfile.create({
    data: {
      userId: user.id,
      university: data.university,
      program: data.program,
      contactNo: data.contactNo ?? null,
      pfpUrl: data.pfpUrl ?? null,
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, profile };
}

export async function generateAdmin(profileData: { university: string; program: string; contactNo?: string }) {
  // Try up to 10 times to find a unique email
  let email = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateAdminEmail();
    const exists = await prisma.user.findUnique({ where: { email: candidate } });
    if (!exists) { email = candidate; break; }
  }
  if (!email) throw new AppError('Could not generate a unique email. Please try again.', 500, 'INTERNAL_ERROR');

  const password = generateAdminPassword();
  const name = email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\d+$/, '').trim();

  const result = await createAdmin({ email, name, password, ...profileData });
  return { ...result, generatedPassword: password, generatedEmail: email };
}

export async function revokeAdmin(id: string) {
  const profile = await prisma.adminProfile.findUnique({ where: { userId: id } });
  if (!profile) throw new AppError('Admin profile not found.', 404, 'NOT_FOUND');
  if (profile.isRevoked) throw new AppError('Admin is already revoked.', 400, 'ALREADY_REVOKED');
  return prisma.adminProfile.update({
    where: { userId: id },
    data: { isRevoked: true, revokedAt: new Date() },
  });
}

export async function reinstateAdmin(id: string) {
  const profile = await prisma.adminProfile.findUnique({ where: { userId: id } });
  if (!profile) throw new AppError('Admin profile not found.', 404, 'NOT_FOUND');
  if (!profile.isRevoked) throw new AppError('Admin is not currently revoked.', 400, 'NOT_REVOKED');
  return prisma.adminProfile.update({
    where: { userId: id },
    data: { isRevoked: false, revokedAt: null },
  });
}

export async function deleteAdmin(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user) throw new AppError('Admin user not found.', 404, 'NOT_FOUND');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new AppError('User is not an admin.', 400, 'NOT_ADMIN');
  }
  await prisma.user.delete({ where: { id } });
}

export async function listAdminProfilesPublic() {
  const profiles = await prisma.adminProfile.findMany({
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
    orderBy: [{ isRevoked: 'asc' }, { createdAt: 'asc' }],
  });

  return profiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.user.name,
    role: p.user.role,
    university: p.university,
    program: p.program,
    pfpUrl: p.pfpUrl,
    contactNo: p.isRevoked ? null : p.contactNo, // hide contact for revoked admins
    isRevoked: p.isRevoked,
    revokedAt: p.revokedAt,
    joinedAt: p.createdAt,
  }));
}

export async function listAdminProfilesFull() {
  const profiles = await prisma.adminProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
    },
    orderBy: [{ isRevoked: 'asc' }, { createdAt: 'asc' }],
  });

  return profiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.user.name,
    email: p.user.email,
    role: p.user.role,
    university: p.university,
    program: p.program,
    pfpUrl: p.pfpUrl,
    contactNo: p.contactNo,
    isRevoked: p.isRevoked,
    revokedAt: p.revokedAt,
    joinedAt: p.createdAt,
    userCreatedAt: p.user.createdAt,
  }));
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

import { Resource, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { buildPrismaArgs, buildPaginatedResult, PaginatedResult } from '../../utils/pagination';
import { GetResourcesQuery, CreateResource } from './resources.schema';

export async function getResources(
  query: GetResourcesQuery
): Promise<PaginatedResult<Resource>> {

  const { subjectId, type, category, year, search, sortBy, cursor, limit } = query;

  const where: Prisma.ResourceWhereInput = {
    isApproved: true,
    ...(subjectId && { subjectId }),
    ...(type && { type }),
    ...(year && { year }),
    ...(category && { subject: { category } }),
    ...(search && {
      title: {
        contains: search,
      },
    }),
  };

  const orderBy: Prisma.ResourceOrderByWithRelationInput =
    sortBy === 'popular'
      ? { downloadsCount: 'desc' }
      : { createdAt: 'desc' };

  const paginationArgs = buildPrismaArgs({ cursor, limit });

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy,
      ...paginationArgs,
      include: {
        subject: {
          include: {
            program: {
              include: {
                institution: true,
              },
            },
          },
        },
      },
    }),
    prisma.resource.count({ where }),
  ]);

  return buildPaginatedResult(items as (Resource & { id: string })[], limit, total);
}

export async function getResourceById(id: string): Promise<Resource> {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      subject: {
        include: {
          program: {
            include: {
              institution: true,
            },
          },
        },
      },
      uploader: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!resource) {
    throw new AppError(`Resource with id '${id}' not found.`, 404, 'NOT_FOUND');
  }

  return resource;
}

export async function incrementDownloads(id: string): Promise<void> {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    throw new AppError(`Resource with id '${id}' not found.`, 404, 'NOT_FOUND');
  }
  await prisma.resource.update({
    where: { id },
    data: { downloadsCount: { increment: 1 } },
  });
}

export async function createResource(
  data: CreateResource,
  uploaderId: string,
  fileUrl: string
): Promise<Resource> {
  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) {
    throw new AppError(`Subject with id '${data.subjectId}' not found.`, 404, 'NOT_FOUND');
  }

  const resource = await prisma.resource.create({
    data: {
      title: data.title,
      type: data.type,
      fileUrl,
      subjectId: data.subjectId,
      uploaderId,
      year: data.year ?? null,
      isAiGenerated: data.isAiGenerated ?? false,
      isApproved: true, // admin-created resources are auto-approved
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

  return resource;
}

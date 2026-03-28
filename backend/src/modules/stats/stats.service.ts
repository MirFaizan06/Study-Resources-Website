import { prisma } from '../../db/prisma';

export interface PlatformStats {
  totalResources: number;
  totalDownloads: number;
  totalInstitutions: number;
  requestsFulfilled: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [totalResources, downloadsAgg, totalInstitutions, requestsFulfilled] = await Promise.all([
    prisma.resource.count({ where: { isApproved: true } }),
    prisma.resource.aggregate({
      where: { isApproved: true },
      _sum: { downloadsCount: true },
    }),
    prisma.institution.count(),
    prisma.request.count({ where: { status: 'FULFILLED' } }),
  ]);

  return {
    totalResources,
    totalDownloads: downloadsAgg._sum.downloadsCount ?? 0,
    totalInstitutions,
    requestsFulfilled,
  };
}

import { prisma } from '../../db/prisma';
import { cache, TTL } from '../../utils/cache';

export interface PlatformStats {
  totalResources: number;
  totalDownloads: number;
  totalInstitutions: number;
  requestsFulfilled: number;
}

const STATS_CACHE_KEY = 'stats:platform';

export async function getPlatformStats(): Promise<PlatformStats> {
  const cached = cache.get<PlatformStats>(STATS_CACHE_KEY);
  if (cached) return cached;

  const [totalResources, downloadsAgg, totalInstitutions, requestsFulfilled] = await Promise.all([
    prisma.resource.count({ where: { isApproved: true } }),
    prisma.resource.aggregate({
      where: { isApproved: true },
      _sum: { downloadsCount: true },
    }),
    prisma.institution.count(),
    prisma.request.count({ where: { status: 'FULFILLED' } }),
  ]);

  const stats: PlatformStats = {
    totalResources,
    totalDownloads: downloadsAgg._sum.downloadsCount ?? 0,
    totalInstitutions,
    requestsFulfilled,
  };

  cache.set(STATS_CACHE_KEY, stats, TTL.STATS);
  return stats;
}

/** Call this when a resource is approved/rejected to keep stats fresh */
export function invalidateStatsCache(): void {
  cache.del(STATS_CACHE_KEY);
}

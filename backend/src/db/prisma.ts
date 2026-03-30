import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Prisma manages its own connection pool via the DATABASE_URL connection string.
 * For Railway MySQL, add these params to DATABASE_URL for production:
 *   ?connection_limit=10&pool_timeout=20&connect_timeout=10
 *
 * Example:
 *   mysql://user:pass@host:3306/db?connection_limit=10&pool_timeout=20
 *
 * connection_limit: max simultaneous DB connections (Railway free tier: keep ≤10)
 * pool_timeout: seconds to wait for a free connection before throwing (default 10)
 * connect_timeout: seconds to wait on initial connection (default 5)
 */
const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    // errorFormat: 'minimal' in production avoids leaking schema details in errors
    errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export { prisma };

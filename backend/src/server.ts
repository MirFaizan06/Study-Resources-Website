import { env } from './config/env';
import app from './app';
import { prisma } from './db/prisma';

const PORT = env.PORT;

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[server] NotesWebsite API running on port ${PORT}`);
  console.log(`[server] Environment: ${env.NODE_ENV}`);
  console.log(`[server] Health: http://localhost:${PORT}/health`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`[server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[server] HTTP server closed.');
    await prisma.$disconnect();
    console.log('[server] Database connection closed.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful close fails
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// ─── Uncaught Errors ──────────────────────────────────────────────────────────
process.on('uncaughtException', (err: Error) => {
  console.error('[server] Uncaught Exception:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[server] Unhandled Promise Rejection:', reason);
  process.exit(1);
});

export default server;

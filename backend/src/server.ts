import { env } from './config/env';
import app from './app';
import { prisma } from './db/prisma';

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = env.PORT;
const HOST = '0.0.0.0';

// Capture the domain: Use Railway's provided domain, otherwise fallback to localhost
const domain = process.env.RAILWAY_PUBLIC_DOMAIN || `localhost:${PORT}`;

// Ensure the protocol is correct (Railway uses HTTPS by default for public domains)
const protocol = process.env.RAILWAY_PUBLIC_DOMAIN ? 'https' : 'http';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 [server] NotesWebsite API is live!`);
  console.log(`🌍 [server] Environment: ${env.NODE_ENV}`);
  console.log(`🔗 [server] Health Check: ${protocol}://${domain}/health`);
  console.log(`📡 [server] Listening on: ${HOST}:${PORT}\n`);
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

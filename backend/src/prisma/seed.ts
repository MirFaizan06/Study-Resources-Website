import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Nazzan2005!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@noteswebsite.com' },
    update: {},
    create: {
      email: 'admin@noteswebsite.com',
      name: 'Site Administrator',
      role: 'ADMIN',
      passwordHash,
    },
  });

  console.log(`Admin ready: ${admin.email}`);
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

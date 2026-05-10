import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { envVars } from '../config/env';

export async function seedAdmin() {
  try {

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(envVars.ADMIN_PASSWORD, 10);

    const admin = await prisma.user.create({
      data: {
        name: envVars.ADMIN_NAME,
        email: envVars.ADMIN_EMAIL,
        password: hashedPassword,
        phone: envVars.ADMIN_PHONE,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log(`Admin created successfully: ${admin.email}`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch(() => {
  process.exit(1);
});
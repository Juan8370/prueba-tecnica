import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function createUser() {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD || 'password123';
  const name = process.env.USER_NAME || 'New User';
  const role = (process.env.USER_ROLE as Role) || Role.patient;
  const specialty = process.env.USER_SPECIALTY; // only for doctors
  const birthDate = process.env.USER_BIRTHDATE; // only for patients

  if (!email) {
    console.error('Error: USER_EMAIL is required. Usage: USER_EMAIL=test@test.com npm run create-user');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        ...(role === Role.doctor && {
          doctor: {
            create: { specialty: specialty || 'General Medicine' },
          },
        }),
        ...(role === Role.patient && {
          patient: {
            create: { birthDate: birthDate ? new Date(birthDate) : new Date('1990-01-01') },
          },
        }),
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    console.log('✅ User created successfully:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('❌ Error: A user with this email already exists.');
    } else {
      console.error('❌ Error creating user:', error);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createUser();

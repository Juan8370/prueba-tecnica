import { PrismaClient, Role, PrescriptionStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const drPassword = await bcrypt.hash('dr123', 10);
  const patientPassword = await bcrypt.hash('patient123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'System Admin',
      password,
      role: Role.admin,
    },
  });

  // 2. Create Doctor
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr@test.com' },
    update: {},
    create: {
      email: 'dr@test.com',
      name: 'Dr. Gregory House',
      password: drPassword,
      role: Role.doctor,
      doctor: {
        create: {
          specialty: 'Diagnostic Medicine',
        },
      },
    },
    include: { doctor: true },
  });

  // 3. Create Patient
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      email: 'patient@test.com',
      name: 'John Doe',
      password: patientPassword,
      role: Role.patient,
      patient: {
        create: {
          birthDate: new Date('1990-01-01'),
        },
      },
    },
    include: { patient: true },
  });

  console.log('Seed data created successfully');
  console.log({ admin, doctorUser, patientUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

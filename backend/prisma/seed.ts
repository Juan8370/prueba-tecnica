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
    update: {
      doctor: {
        update: {
          medicalLicense: '75849302-1',
          signature: 'Dr. Gregory House - M.D.',
        },
      },
    },
    create: {
      email: 'dr@test.com',
      name: 'Dr. Gregory House',
      password: drPassword,
      role: Role.doctor,
      doctor: {
        create: {
          specialty: 'Diagnostic Medicine',
          medicalLicense: '75849302-1',
          signature: 'Dr. Gregory House - M.D.',
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

  // 4. Create Prescriptions
  if (doctorUser.doctor && patientUser.patient) {
    const prescriptions = [
      {
        code: 'RX-001',
        status: PrescriptionStatus.pending,
        notes: 'Take with food',
        items: [
          { name: 'Amoxicillin', dosage: '500mg', quantity: 20, instructions: 'Every 8 hours' },
          { name: 'Ibuprofen', dosage: '400mg', quantity: 10, instructions: 'If pain persists' },
        ],
      },
      {
        code: 'RX-002',
        status: PrescriptionStatus.consumed,
        notes: 'Rest for 3 days',
        consumedAt: new Date(),
        items: [
          { name: 'Paracetamol', dosage: '1g', quantity: 15, instructions: 'Twice a day' },
        ],
      },
      {
        code: 'RX-003',
        status: PrescriptionStatus.pending,
        notes: 'General checkup',
        items: [
          { name: 'Vitamin C', dosage: '1000mg', quantity: 30, instructions: 'Once a day' },
        ],
      },
      {
        code: 'RX-004',
        status: PrescriptionStatus.pending,
        items: [
          { name: 'Loratadine', dosage: '10mg', quantity: 10, instructions: 'At night' },
        ],
      },
      {
        code: 'RX-005',
        status: PrescriptionStatus.consumed,
        consumedAt: new Date(Date.now() - 86400000), // yesterday
        items: [
          { name: 'Omeprazole', dosage: '20mg', quantity: 14, instructions: 'Before breakfast' },
        ],
      },
    ];

    for (const p of prescriptions) {
      await prisma.prescription.upsert({
        where: { code: p.code },
        update: {},
        create: {
          code: p.code,
          status: p.status,
          notes: p.notes,
          consumedAt: p.consumedAt,
          authorId: doctorUser.doctor.id,
          patientId: patientUser.patient.id,
          items: {
            create: p.items,
          },
        },
      });
    }
  }

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

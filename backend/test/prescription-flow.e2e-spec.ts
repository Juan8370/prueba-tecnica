import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';

const request = require('supertest');
const cookieParser = require('cookie-parser');

describe('Prescription Flow (e2e)', () => {
  let app: INestApplication;
  let doctorCookie: string;
  let patientCookie: string;
  let patientId: string;
  let prescriptionId: string;

  const timestamp = Date.now();
  const doctorEmail = `dr_${timestamp}@test.com`;
  const patientEmail = `pt_${timestamp}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a doctor', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: doctorEmail,
        password: 'password123',
        name: 'Dr. Test',
        role: 'doctor',
      })
      .expect(201);
  });

  it('should register a patient', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: patientEmail,
        password: 'password123',
        name: 'Patient Test',
        role: 'patient',
      })
      .expect(201);
  });

  it('should login as doctor and get cookies', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: doctorEmail, password: 'password123' })
      .expect(201);

    const cookies = res.headers['set-cookie'] as string[];
    const accessCookie = cookies.find((c: string) => c.startsWith('access_token='));
    expect(accessCookie).toBeDefined();
    doctorCookie = accessCookie.split(';')[0];
  });

  it('should login as patient, get cookies and profile to extract patientId', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: patientEmail, password: 'password123' })
      .expect(201);

    const cookies = loginRes.headers['set-cookie'] as string[];
    const accessCookie = cookies.find((c) => c.startsWith('access_token='));
    expect(accessCookie).toBeDefined();
    patientCookie = accessCookie.split(';')[0];

    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Cookie', [patientCookie])
      .expect(200);

    expect(profileRes.body.patient).toBeDefined();
    patientId = profileRes.body.patient.id;
  });

  it('should allow doctor to create a prescription for the patient', async () => {
    const res = await request(app.getHttpServer())
      .post('/prescriptions')
      .set('Cookie', [doctorCookie])
      .send({
        patientId: patientId,
        notes: 'Test notes',
        items: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            quantity: 10,
            instructions: 'Take 1 every 8 hours',
          },
        ],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    prescriptionId = res.body.id;
    expect(res.body.status).toBe('pending');
  });

  it('should allow patient to fetch their prescriptions', async () => {
    const res = await request(app.getHttpServer())
      .get('/me/prescriptions')
      .set('Cookie', [patientCookie])
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBeGreaterThan(0);
    const pres = res.body.data.find((p: any) => p.id === prescriptionId);
    expect(pres).toBeDefined();
  });

  it('should allow patient to consume their prescription', async () => {
    const res = await request(app.getHttpServer())
      .put(`/prescriptions/${prescriptionId}/consume`)
      .set('Cookie', [patientCookie])
      .expect(200);

    expect(res.body.status).toBe('consumed');
    expect(res.body.consumedAt).toBeDefined();
  });

  it('should allow patient to download PDF', async () => {
    const res = await request(app.getHttpServer())
      .get(`/prescriptions/${prescriptionId}/pdf`)
      .set('Cookie', [patientCookie])
      .expect(200);

    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body).toBeDefined();
  });
});
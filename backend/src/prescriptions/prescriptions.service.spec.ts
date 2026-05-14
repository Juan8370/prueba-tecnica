import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionsService } from './prescriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionStatus, Role } from '@prisma/client';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      doctor: { findUnique: jest.fn() },
      patient: { findUnique: jest.fn() },
      prescription: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('consume', () => {
    it('should throw ForbiddenException if user is not a patient', async () => {
      prisma.patient.findUnique.mockResolvedValue(null);

      await expect(
        service.consume('prescription-1', 'doctor-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if prescription does not exist', async () => {
      prisma.patient.findUnique.mockResolvedValue({
        id: 'patient-1',
        userId: 'patient-user-id',
      } as any);
      prisma.prescription.findUnique.mockResolvedValue(null);

      await expect(
        service.consume('non-existent', 'patient-user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if prescription belongs to another patient', async () => {
      prisma.patient.findUnique.mockResolvedValue({
        id: 'patient-1',
        userId: 'patient-user-id',
      } as any);
      prisma.prescription.findUnique.mockResolvedValue({
        id: 'prescription-1',
        patientId: 'patient-2',
      } as any);

      await expect(
        service.consume('prescription-1', 'patient-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if prescription is already consumed', async () => {
      prisma.patient.findUnique.mockResolvedValue({
        id: 'patient-1',
        userId: 'patient-user-id',
      } as any);
      prisma.prescription.findUnique.mockResolvedValue({
        id: 'prescription-1',
        patientId: 'patient-1',
        status: PrescriptionStatus.consumed,
      } as any);

      await expect(
        service.consume('prescription-1', 'patient-user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update and return prescription if validation passes', async () => {
      prisma.patient.findUnique.mockResolvedValue({
        id: 'patient-1',
        userId: 'patient-user-id',
      } as any);
      prisma.prescription.findUnique.mockResolvedValue({
        id: 'prescription-1',
        patientId: 'patient-1',
        status: PrescriptionStatus.pending,
      } as any);

      const updatedPrescription = {
        id: 'prescription-1',
        status: PrescriptionStatus.consumed,
      };
      prisma.prescription.update.mockResolvedValue(updatedPrescription as any);

      const result = await service.consume('prescription-1', 'patient-user-id');

      expect(prisma.prescription.update).toHaveBeenCalledWith({
        where: { id: 'prescription-1' },
        data: {
          status: PrescriptionStatus.consumed,
          consumedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedPrescription);
    });
  });
});

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionQueryDto } from './dto/prescription-query.dto';
import { Role, PrescriptionStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
    doctorUserId: string,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new ForbiddenException('Only doctors can create prescriptions');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: createPrescriptionDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const code = this.generateCode();

    return this.prisma.prescription.create({
      data: {
        code,
        notes: createPrescriptionDto.notes,
        patientId: createPrescriptionDto.patientId,
        authorId: doctor.id,
        items: {
          create: createPrescriptionDto.items,
        },
      },
      include: {
        items: true,
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        author: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: PrescriptionQueryDto, userId: string, role: Role) {
    const {
      status,
      patientId,
      authorId,
      from,
      to,
      page = 1,
      limit = 10,
      order = 'desc',
      mine,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        {
          patient: {
            user: {
              name: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    // Role based filtering
    if (role === Role.doctor) {
      if (mine === 'true') {
        const doctor = await this.prisma.doctor.findUnique({
          where: { userId },
        });
        where.authorId = doctor?.id;
      } else if (authorId) {
        where.authorId = authorId;
      }
    } else if (role === Role.patient) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      where.patientId = patient?.id;
    } else if (role === Role.admin) {
      if (patientId) where.patientId = patientId;
      if (authorId) where.authorId = authorId;
    }

    const [total, data] = await Promise.all([
      this.prisma.prescription.count({ where }),
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: {
          items: true,
          patient: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          author: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, role: Role) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        author: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Access control
    if (role === Role.doctor) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      if (prescription.authorId !== doctor?.id) {
        throw new ForbiddenException(
          'You can only view your own prescriptions',
        );
      }
    } else if (role === Role.patient) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (prescription.patientId !== patient?.id) {
        throw new ForbiddenException(
          'You can only view your own prescriptions',
        );
      }
    }

    return prescription;
  }

  async consume(id: string, userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
      throw new ForbiddenException('Only patients can consume prescriptions');
    }

    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.patientId !== patient.id) {
      throw new ForbiddenException(
        'You can only consume your own prescriptions',
      );
    }

    if (prescription.status === PrescriptionStatus.consumed) {
      throw new BadRequestException('Prescription already consumed');
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        status: PrescriptionStatus.consumed,
        consumedAt: new Date(),
      },
    });
  }

  async generatePdf(id: string, userId: string, role: Role): Promise<Buffer> {
    const prescription = await this.findOne(id, userId, role);

    // Generate QR Code data URL
    const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const qrUrl = `${frontEndUrl}/patient/prescriptions/${id}`;
    let qrBuffer: Buffer | null = null;

    try {
      const qrDataUrl = await QRCode.toDataURL(qrUrl);
      const base64Data = qrDataUrl.split(';base64,').pop();
      if (base64Data) {
        qrBuffer = Buffer.from(base64Data, 'base64');
      }
    } catch (e) {
      console.error('Error generating QR code', e);
    }

    return new Promise((resolve, reject) => {
      const PDF = require('pdfkit');
      const doc = new PDF({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const result = Buffer.concat(buffers);
        resolve(result);
      });
      doc.on('error', (err: Error) => reject(err));

      // Header
      doc
        .fillColor('#4F46E5')
        .fontSize(24)
        .text('RECETA MÉDICA', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fillColor('#64748B')
        .fontSize(10)
        .text(`Código Único: ${prescription.code}`, { align: 'right' });
      doc.text(
        `Fecha de Emisión: ${prescription.createdAt.toLocaleDateString('es-ES')}`,
        { align: 'right' },
      );

      if (qrBuffer) {
        doc.image(qrBuffer, 500, 30, { width: 60 });
      }

      doc.moveDown(2);

      // Main Container
      const startY = doc.y;

      // Doctor Column
      doc.fillColor('#1E293B').fontSize(14).text('MÉDICO TRATANTE', 50, startY);
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#334155');
      doc.text(`Dr. ${prescription.author.user.name}`);
      doc.text(`${prescription.author.specialty || 'Medicina General'}`);
      doc.text(
        `Cédula: ${prescription.author.medicalLicense || 'No registrada'}`,
      );

      // Patient Column
      doc.fillColor('#1E293B').fontSize(14).text('PACIENTE', 300, startY);
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#334155');
      doc.text(`${prescription.patient.user.name}`);
      doc.text(`${prescription.patient.user.email}`);

      doc.moveDown(3);
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .stroke();
      doc.moveDown(1.5);

      // Prescription Items
      doc
        .fillColor('#1E293B')
        .fontSize(16)
        .text('PRESCRIPCIÓN Y DOSIS', { underline: true });
      doc.moveDown(1);

      prescription.items.forEach((item, index) => {
        doc
          .fillColor('#1E293B')
          .fontSize(12)
          .text(`${index + 1}. ${item.name}`, { continued: true });
        doc
          .fillColor('#6366F1')
          .text(`  -  ${item.dosage} (Cant: ${item.quantity})`);

        if (item.instructions) {
          doc.moveDown(0.2);
          doc
            .fillColor('#64748B')
            .fontSize(10)
            .text(`Instrucciones: ${item.instructions}`, { indent: 20 });
        }
        doc.moveDown(1);
      });

      if (prescription.notes) {
        doc.moveDown(1);
        doc
          .fillColor('#1E293B')
          .fontSize(12)
          .text('NOTAS ADICIONALES:', { underline: true });
        doc.moveDown(0.5);
        doc.fillColor('#475569').fontSize(10).text(prescription.notes);
      }

      // Footer / Signature Area
      const footerY = 700;
      doc
        .moveTo(150, footerY)
        .lineTo(450, footerY)
        .strokeColor('#94A3B8')
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.5);

      if (prescription.author.signature) {
        try {
          const base64Data = prescription.author.signature
            .split(';base64,')
            .pop();
          if (base64Data) {
            const signatureBuffer = Buffer.from(base64Data, 'base64');
            // Centrar la firma (200px de ancho) sobre la línea
            doc.image(signatureBuffer, 197.5, footerY - 70, { width: 200 });
          }
        } catch (e) {
          console.error('Error rendering signature image in PDF', e);
        }
      }

      doc
        .fillColor('#1E293B')
        .fontSize(11)
        .text(`Dr. ${prescription.author.user.name}`, 50, footerY + 10, {
          align: 'center',
        });
      doc
        .fontSize(9)
        .fillColor('#64748B')
        .text(
          `Cédula Profesional: ${prescription.author.medicalLicense || 'N/A'}`,
          50,
          footerY + 25,
          { align: 'center' },
        );

      doc.end();
    });
  }

  private generateCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}

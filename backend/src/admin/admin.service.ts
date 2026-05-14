import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(from?: Date, to?: Date) {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [doctors, patients, prescriptions, statusGroups, dailyGroups] =
      await Promise.all([
        this.prisma.doctor.count(),
        this.prisma.patient.count(),
        this.prisma.prescription.count({ where }),
        this.prisma.prescription.groupBy({
          by: ['status'],
          _count: true,
          where,
        }),
        this.prisma.prescription.findMany({
          where,
          select: {
            createdAt: true,
          },
        }),
      ]);

    // Process byStatus
    const byStatus = {
      pending:
        statusGroups.find((g) => g.status === PrescriptionStatus.pending)
          ?._count || 0,
      consumed:
        statusGroups.find((g) => g.status === PrescriptionStatus.consumed)
          ?._count || 0,
    };

    // Process byDay (simplified)
    const dailyMap = new Map<string, number>();
    dailyGroups.forEach((p) => {
      const date = p.createdAt.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    const byDay = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top doctors (top 5)
    const topDoctorsRaw = await this.prisma.prescription.groupBy({
      by: ['authorId'],
      _count: true,
      orderBy: {
        _count: {
          authorId: 'desc',
        },
      },
      take: 5,
    });

    const doctorIds = topDoctorsRaw.map((d) => d.authorId);
    
    const doctorsData = await this.prisma.doctor.findMany({
      where: { id: { in: doctorIds } },
      include: { user: { select: { name: true } } },
    });

    const doctorMap = new Map(doctorsData.map(doc => [doc.id, doc.user.name]));

    const topDoctors = topDoctorsRaw.map((d) => ({
      doctorId: d.authorId,
      name: doctorMap.get(d.authorId) || 'Desconocido',
      count: d._count,
    }));

    return {
      totals: {
        doctors,
        patients,
        prescriptions,
      },
      byStatus,
      byDay,
      topDoctors,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (query) {
      where.OR = [
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          user: {
            name: 'asc',
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
}

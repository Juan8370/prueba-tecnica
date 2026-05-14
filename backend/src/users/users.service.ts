import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
      },
    });
  }

  async findAll(query: { role?: string; search?: string; page?: number; limit?: number }) {
    const { role, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createUser(data: any) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { password, ...userData } = data;
    
    // Si se pasa role, crear el perfil correspondiente
    let include = {};
    const createData: any = {
      ...userData,
      password: hashedPassword,
    };

    if (data.role === 'doctor') {
      createData.doctor = { create: {} };
      include = { doctor: true };
    } else if (data.role === 'patient') {
      createData.patient = { create: {} };
      include = { patient: true };
    }

    return this.prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
  }

  async create(data: any) {
    return this.prisma.user.create({
      data,
      include: {
        doctor: true,
        patient: true,
      },
    });
  }
}

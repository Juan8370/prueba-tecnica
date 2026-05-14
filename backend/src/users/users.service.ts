import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        doctor: {
          select: { id: true, specialty: true, medicalLicense: true },
        },
        patient: {
          select: { id: true, birthDate: true },
        },
      },
    });
    return user;
  }

  async findAll(query: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as Role;
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
        skip: Number(skip) || 0,
        take: Number(limit) || 10,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
    };
  }

  async createUser(data: CreateUserDto) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        ...(data.role === Role.doctor && { doctor: { create: {} } }),
        ...(data.role === Role.patient && { patient: { create: {} } }),
      },
    });
  }

  async create(data: CreateUserDto) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // Ya viene hasheada desde AuthService si pasa por ahí
        name: data.name,
        role: data.role,
        ...(data.role === Role.doctor && { doctor: { create: {} } }),
        ...(data.role === Role.patient && { patient: { create: {} } }),
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateSignature(userId: string, signature: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Perfil de doctor no encontrado');
    }

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { signature },
    });
  }
}

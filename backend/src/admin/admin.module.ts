import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';

@Module({
  imports: [PrismaModule, PrescriptionsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

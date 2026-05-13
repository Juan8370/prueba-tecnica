import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { PrescriptionQueryDto } from '../prescriptions/dto/prescription-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  @Get('prescriptions')
  findAllPrescriptions(@Query() query: PrescriptionQueryDto) {
    return this.prescriptionsService.findAll(query, '', Role.admin);
  }

  @Get('metrics')
  getMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.adminService.getMetrics(fromDate, toDate);
  }
}

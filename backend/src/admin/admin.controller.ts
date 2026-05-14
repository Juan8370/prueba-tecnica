import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { PrescriptionQueryDto } from '../prescriptions/dto/prescription-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  @Get('prescriptions')
  @ApiOperation({
    summary: 'Obtener todas las prescripciones sin restricciones (solo Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de todas las prescripciones',
  })
  findAllPrescriptions(@Query() query: PrescriptionQueryDto) {
    return this.prescriptionsService.findAll(query, '', Role.admin);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Obtener métricas y estadísticas globales (solo Admin)',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Fecha de inicio (ISO String)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Fecha de fin (ISO String)',
  })
  @ApiResponse({ status: 200, description: 'Métricas calculadas' })
  getMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.adminService.getMetrics(fromDate, toDate);
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(Role.doctor, Role.admin)
  findAll(
    @Query('query') query?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.patientsService.findAll(query, parseInt(page), parseInt(limit));
  }
}

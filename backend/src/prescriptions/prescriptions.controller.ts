import { Controller, Get, Post, Put, Param, Body, UseGuards, Query, Res, Header } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionQueryDto } from './dto/prescription-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import * as express from 'express';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post('prescriptions')
  @Roles(Role.doctor)
  create(@Body() createPrescriptionDto: CreatePrescriptionDto, @CurrentUser('id') userId: string) {
    return this.prescriptionsService.create(createPrescriptionDto, userId);
  }

  @Get('prescriptions')
  @Roles(Role.doctor, Role.admin)
  findAll(@Query() query: PrescriptionQueryDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: Role) {
    return this.prescriptionsService.findAll(query, userId, role);
  }

  @Get('prescriptions/:id')
  @Roles(Role.doctor, Role.patient, Role.admin)
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: Role) {
    return this.prescriptionsService.findOne(id, userId, role);
  }

  @Get('me/prescriptions')
  @Roles(Role.patient)
  findMyPrescriptions(@Query() query: PrescriptionQueryDto, @CurrentUser('id') userId: string) {
    return this.prescriptionsService.findAll(query, userId, Role.patient);
  }

  @Put('prescriptions/:id/consume')
  @Roles(Role.patient)
  consume(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.prescriptionsService.consume(id, userId);
  }

  @Get('prescriptions/:id/pdf')
  @Roles(Role.patient, Role.doctor, Role.admin)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="prescription.pdf"')
  async generatePdf(
    @Param('id') id: string, 
    @CurrentUser('id') userId: string, 
    @CurrentUser('role') role: Role,
    @Res() res: express.Response
  ) {
    const buffer = await this.prescriptionsService.generatePdf(id, userId, role);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescripcion-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.status(200).send(buffer);
  }
}

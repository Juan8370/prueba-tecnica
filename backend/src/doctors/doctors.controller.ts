import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Patch('me/signature')
  @Roles(Role.doctor)
  async updateSignature(@Request() req: any, @Body('signature') signature: string) {
    return this.doctorsService.updateSignature(req.user.id, signature);
  }
}

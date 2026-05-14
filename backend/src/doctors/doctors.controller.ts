import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DoctorsService } from './doctors.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Patch('me/signature')
  @Roles(Role.doctor)
  @ApiOperation({
    summary: 'Actualizar la firma médica en base64 (solo Doctores)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        signature: {
          type: 'string',
          description: 'Imagen de la firma en formato base64',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Firma actualizada correctamente' })
  async updateSignature(
    @Request() req: any,
    @Body('signature') signature: string,
  ) {
    return this.doctorsService.updateSignature(req.user.id, signature);
  }
}

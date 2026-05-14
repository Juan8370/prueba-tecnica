import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users (Admin)')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (solo Admin)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filtrar por rol' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre o email',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuarios' })
  findAll(
    @Query()
    query: {
      role?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    return this.usersService.findAll(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un usuario manualmente desde el panel de Admin',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 400, description: 'Errores de validación' })
  create(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }
}

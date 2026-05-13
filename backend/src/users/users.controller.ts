import { Controller, Get, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    // TODO: Implement paginated user listing with role and query filters (Admin only)
    return 'Endpoint GET /users OK';
  }

  @Post()
  create() {
    // TODO: Implement user creation with roles (Admin only)
    return 'Endpoint POST /users OK';
  }
}

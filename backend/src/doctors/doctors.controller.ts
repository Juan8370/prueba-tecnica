import { Controller, Get } from '@nestjs/common';

@Controller('doctors')
export class DoctorsController {
  @Get()
  findAll() {
    // TODO: Implement paginated doctor listing with simple filters
    return 'Endpoint GET /doctors OK';
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller('patients')
export class PatientsController {
  @Get()
  findAll() {
    // TODO: Implement paginated patient listing with simple filters
    return 'Endpoint GET /patients OK';
  }
}

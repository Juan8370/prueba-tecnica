import { Controller, Get } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Get('prescriptions')
  findAllPrescriptions() {
    // TODO: Implement global prescription listing with advanced filters for Admin
    return 'Endpoint GET /admin/prescriptions OK';
  }

  @Get('metrics')
  getMetrics() {
    // TODO: Implement metrics calculation (totals, by status, by day, top doctors)
    return 'Endpoint GET /admin/metrics OK';
  }
}

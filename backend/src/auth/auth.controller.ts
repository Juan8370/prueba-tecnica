import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('register')
  register() {
    // TODO: Implement user registration (doctor or patient)
    return 'Endpoint POST /auth/register OK';
  }

  @Post('login')
  login() {
    // TODO: Implement user login and return tokens
    return 'Endpoint POST /auth/login OK';
  }

  @Post('refresh')
  refresh() {
    // TODO: Implement token refresh logic
    return 'Endpoint POST /auth/refresh OK';
  }

  @Get('profile')
  getProfile() {
    // TODO: Return current user profile and role
    return 'Endpoint GET /auth/profile OK';
  }
}

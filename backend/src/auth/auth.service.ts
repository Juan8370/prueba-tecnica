import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const { password, ...userData } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'accessSecret',
        expiresIn: (process.env.JWT_ACCESS_TTL || '15m') as any,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
        expiresIn: (process.env.JWT_REFRESH_TTL || '7d') as any,
      }),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
      });
      const newPayload = {
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
      };
      return {
        accessToken: this.jwtService.sign(newPayload, {
          secret: process.env.JWT_ACCESS_SECRET || 'accessSecret',
          expiresIn: (process.env.JWT_ACCESS_TTL || '15m') as any,
        }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    return this.usersService.getProfile(userId);
  }
}

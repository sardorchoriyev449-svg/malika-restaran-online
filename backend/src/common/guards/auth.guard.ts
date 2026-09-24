import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PROTECTED_KEY } from './protected.guard';
import { getAccessTime, getAccessToken, getRefreshToken } from '../configs/tokens.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const isProtected = this.reflector.getAllAndOverride<boolean>(
      PROTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isProtected) return true;

    const accessTokenValue =
      request.signedCookies?.['accessToken'] ||
      request.cookies?.['accessToken'];

    if (accessTokenValue && accessTokenValue !== 'j:{}') {
      try {
        const decoded = await this.jwtService.verifyAsync(accessTokenValue, {
          secret: getAccessToken(),
        });
        request.user = decoded;
        return true;
      } catch {
      }
    }

    const refreshTokenValue = request.signedCookies?.['refreshToken'] || request.cookies?.['refreshToken'];

    if (refreshTokenValue && refreshTokenValue !== 'j:{}') {
      try {
        const decoded = await this.jwtService.verifyAsync(refreshTokenValue, {
          secret: getRefreshToken(), 
        });

        const newAccessToken = await this.jwtService.signAsync(
          { id: decoded.id, role: decoded.role },
          { secret: getAccessToken(), expiresIn: getAccessTime() },
        );

        response.cookie('accessToken', newAccessToken, {
          signed: true,
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
        });

        request.user = decoded;
        return true;
      } catch {
      }
    }

    throw new UnauthorizedException('Avtorizatsiyadan o\'ting');
  }
}
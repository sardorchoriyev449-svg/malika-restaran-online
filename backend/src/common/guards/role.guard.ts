import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Request } from "express";
import { UserRoles } from './user-role.guard';

export interface RequestWithUser extends Request {
    user: {
        id: string;
        fullName: string;
        email:string,
        role: string;
        image_url:string
        isActive:boolean
    }
}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Siz avtorizatsiyadan o\'tmagansiz');
    }

    if (user.role === UserRoles.admin) {
      return true;
    }

    throw new ForbiddenException('Faqat admin kiroladi');
  }
}
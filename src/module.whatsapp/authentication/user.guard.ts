import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DataBaseService } from '../database.service';
import { Reflector } from '@nestjs/core';
import { Role } from '../database/models/user.entity';
import { AUTHORIZED_TYPES_KEY } from './roles.decorator';

@Injectable()
class UserRolesGuard implements CanActivate {
  constructor(private dataBaseService: DataBaseService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(AUTHORIZED_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const token = context.switchToHttp().getRequest().headers.authorization;
    if (!token) {
      return false;
    }

    const user = await this.dataBaseService.userFindByToken(token);
    if (!user || !requiredRoles.includes(user.role)) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}

export { UserRolesGuard, AUTHORIZED_TYPES_KEY };

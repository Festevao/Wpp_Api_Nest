import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DataBaseService } from '../database.service';
import { AUTHORIZED_TYPES_KEY } from './roles.decorator';

@Injectable()
class ClientRoleGuard implements CanActivate {
  constructor(private dataBaseService: DataBaseService) {}

  async canActivate(context: ExecutionContext) {
    const token = context.switchToHttp().getRequest().headers.authorization;
    if (!token) {
      return false;
    }

    const user = await this.dataBaseService.userFindByToken(token);
    if (!user) {
      return false;
    }

    const bot_id = context.switchToHttp().getRequest().params.wppClientId;
    if (!bot_id) {
      return true;
    }

    const clients = await this.dataBaseService.botFindByUserId(user.userId);
    if (!clients || clients.length === 0) {
      return false;
    }

    return clients.some((client) => client.botId === bot_id);
  }
}

export { ClientRoleGuard, AUTHORIZED_TYPES_KEY };

import { Controller, Patch, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataBaseService } from './database.service';
import { UserDTO } from './dto/user.body.dto';
import { Authorized } from './authentication/roles.decorator';
import { UserRolesGuard } from './authentication/user.guard';
import { Role } from './database/models/user.entity';

@ApiTags('Users')
@UseGuards(UserRolesGuard)
@Controller('users')
class WppUsersController {
  constructor(private dataBaseService: DataBaseService) {}
  @Get('get')
  @Authorized(Role.ADMIN)
  async getAll() {
    return await this.dataBaseService.userFindAll();
  }

  @Get('get/:userId')
  @Authorized(Role.ADMIN)
  async getById(@Param() params: { userId: string }) {
    console.log('params:', params);
    return await this.dataBaseService.userFindById(params.userId);
  }

  @Patch('')
  @Authorized(Role.ADMIN)
  async create(@Body() body: UserDTO) {
    return await this.dataBaseService.userCreate(body);
  }
}

export { WppUsersController };

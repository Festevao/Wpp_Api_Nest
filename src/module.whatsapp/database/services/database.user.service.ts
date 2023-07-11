import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { Bot } from '../models/bot.entity';
import { UserDTO } from '../../dto/user.body.dto';
import { randomBytes } from 'crypto';

@Injectable()
class DataBaseUserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('BOT_REPOSITORY')
    private botRepository: Repository<Bot>
  ) {}

  async userCreate(user: UserDTO) {
    if (!user.token) {
      user.token = randomBytes(16).toString('hex');
    }
    return await this.userRepository.insert(user);
  }

  async userFindAll() {
    return await this.userRepository.find();
  }

  async userFindById(userId: string) {
    return await this.userRepository.findOne({ where: { userId } });
  }

  async userFindByToken(token: string) {
    return await this.userRepository.findOne({ where: { token } });
  }

  async userFindByBotId(botId: string) {
    return (await this.botRepository.findOne({ where: { botId } })).userId;
  }
}

export { DataBaseUserService };

import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './database/models/user.entity';
import { Bot } from './database/models/bot.entity';
import { TxtMessage } from './database/models/textMsg.entity';
import { UserDTO } from './dto/user.body.dto';
import { ClientDTO } from './dto/client.dto';
import { randomBytes } from 'crypto';

@Injectable()
class DataBaseService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('BOT_REPOSITORY')
    private botRepository: Repository<Bot>,
    @Inject('TXT_MESSAGE_REPOSITORY')
    private txtMessageRepository: Repository<TxtMessage>
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

  async botCreate(bot: ClientDTO) {
    if (!bot.encodeToken) {
      bot.encodeToken = randomBytes(16).toString('hex');
    }
    return await this.botRepository.insert(bot);
  }

  async botFindAll() {
    return await this.botRepository.find();
  }

  async botFindById(botId: string) {
    return await this.botRepository.findOne({ where: { botId } });
  }

  async botFindByUserId(userId: string) {
    return await this.botRepository.find({ where: { userId: userId as any } });
  }

  async txtMessageFindAll() {
    return await this.txtMessageRepository.find();
  }
}

export { DataBaseService };

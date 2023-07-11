import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Bot } from '../models/bot.entity';
import { ClientDTO } from '../../dto/client.dto';
import { randomBytes } from 'crypto';

@Injectable()
class DataBaseBotService {
  constructor(
    @Inject('BOT_REPOSITORY')
    private botRepository: Repository<Bot>
  ) {}

  async dropById(botId: string) {
    return await this.botRepository.delete({ botId });
  }

  async create(bot: ClientDTO) {
    if (!bot.encodeToken) {
      bot.encodeToken = randomBytes(16).toString('hex');
    }
    return await this.botRepository.insert(bot);
  }

  async findAll() {
    return await this.botRepository.find();
  }

  async findById(botId: string) {
    return await this.botRepository.findOne({ where: { botId } });
  }

  async findByUserId(userId: string) {
    return await this.botRepository.find({ where: { userId: userId as any } });
  }
}

export { DataBaseBotService };

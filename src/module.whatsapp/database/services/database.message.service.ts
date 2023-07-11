import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from '../models/message.entity';

@Injectable()
class DataBaseMessageService {
  constructor(
    @Inject('MESSAGE_REPOSITORY')
    private messageRepository: Repository<Message>
  ) {}

  async messageFindAll() {
    return await this.messageRepository.find();
  }

  async messageCreate(msg: any) {
    return await this.messageRepository.insert(msg);
  }
}

export { DataBaseMessageService };

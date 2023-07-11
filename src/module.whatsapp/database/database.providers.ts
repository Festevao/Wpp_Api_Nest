import { DataSource } from 'typeorm';
import { User } from './models/user.entity';
import { Bot } from './models/bot.entity';
import { Message } from './models/message.entity';
import { MessageMedia } from './models/messageMedia.entity';
import { Campaign } from './models/campaign.entity';
import { Contact } from './models/contact.entity';

export const databaseProviders = [
  {
    provide: 'WHATSAPP_DATA',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: process.env.DB_TYPE as any,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [__dirname + '/models/*.entity{.ts,.js}'],
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
      });

      return dataSource.initialize();
    },
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['WHATSAPP_DATA'],
  },
  {
    provide: 'BOT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Bot),
    inject: ['WHATSAPP_DATA'],
  },
  {
    provide: 'MESSAGE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
    inject: ['WHATSAPP_DATA'],
  },
  {
    provide: 'MESSAGE_MEDIA_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MessageMedia),
    inject: ['WHATSAPP_DATA'],
  },
  {
    provide: 'CONTACT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Contact),
    inject: ['WHATSAPP_DATA'],
  },
  {
    provide: 'CAMPAIGN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Campaign),
    inject: ['WHATSAPP_DATA'],
  },
];

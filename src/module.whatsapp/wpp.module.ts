import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { databaseProviders } from './database/database.providers';
import { DataBaseService } from './database.service';
import { WppClientsController } from './wpp.clients.controller';
import { WppMailService } from './wpp.mailer.service';
import { WppUsersController } from './wpp.users.controller';
import { WppClientsService } from './wppClientUtils/clients.service.old';
import { WebhookService } from './wpp.webhook.service';
import { UserRolesGuard, AUTHORIZED_TYPES_KEY } from './authentication/user.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      template: {
        dir: 'src/templates/email',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  controllers: [WppClientsController, WppUsersController],
  providers: [
    ...databaseProviders,
    WppMailService,
    DataBaseService,
    WppClientsService,
    WebhookService,
    {
      provide: AUTHORIZED_TYPES_KEY,
      useClass: UserRolesGuard,
    },
  ],
})
export class WhatsappModule {}

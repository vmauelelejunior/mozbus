import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { ChatController } from './chat.controller';
import { WhatsAppService } from './whatsapp.service';
import { LumianaService } from './lumiana.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppController, ChatController],
  providers: [WhatsAppService, LumianaService],
  exports: [LumianaService],
})
export class WhatsAppModule {}

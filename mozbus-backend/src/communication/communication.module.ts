import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CommunicationController],
  providers: [CommunicationService, PrismaService],
})
export class CommunicationModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, SupabaseService],
  exports: [UsersService],
})
export class UsersModule {}

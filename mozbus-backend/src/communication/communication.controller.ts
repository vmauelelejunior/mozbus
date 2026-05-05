import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('communication')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('send')
  async sendMessage(@Request() req: any, @Body() body: { companyId: string; content: string }) {
    return this.communicationService.sendMessage(req.user.id, body.companyId, body.content);
  }

  @Get('messages/:companyId')
  async getMessages(@Param('companyId') companyId: string) {
    return this.communicationService.getMessagesByCompany(companyId);
  }

  @Patch('read/:id')
  async markRead(@Request() req: any, @Param('id') id: string) {
    return this.communicationService.markAsRead(id, req.user.role);
  }

  @Get('unread')
  async getUnread(@Request() req: any) {
    return this.communicationService.getUnreadCount(req.user.id, req.user.role, req.user.companyId);
  }

  @Get('unread-details')
  async getUnreadDetails(@Request() req: any) {
    return this.communicationService.getUnreadMessages(req.user.id, req.user.role, req.user.companyId);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, companyId: string, content: string) {
    return this.prisma.message.create({
      data: {
        content,
        senderId,
        companyId,
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true,
          }
        }
      }
    });
  }

  async getMessagesByCompany(companyId: string) {
    return this.prisma.message.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            name: true,
            role: true,
          }
        }
      }
    });
  }

  async markAsRead(messageId: string, role: string) {
    const data = role === 'SUPER_ADMIN' ? { isReadByCeo: true } : { isReadByAdmin: true };
    return this.prisma.message.update({
      where: { id: messageId },
      data,
    });
  }

  async getUnreadCount(userId: string, role: string, companyId?: string) {
    if (role === 'SUPER_ADMIN') {
      return this.prisma.message.count({
        where: { 
          isReadByCeo: false,
          sender: { role: { not: 'SUPER_ADMIN' } }
        },
      });
    } else {
      return this.prisma.message.count({
        where: { 
          companyId,
          isReadByAdmin: false,
          sender: { role: 'SUPER_ADMIN' }
        },
      });
    }
  }

  async getUnreadMessages(userId: string, role: string, companyId?: string) {
    const where: any = role === 'SUPER_ADMIN' 
      ? { isReadByCeo: false, sender: { role: { not: 'SUPER_ADMIN' } } } 
      : { companyId, isReadByAdmin: false, sender: { role: 'SUPER_ADMIN' } };

    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            name: true,
            role: true,
          }
        },
        company: {
          select: {
            name: true
          }
        }
      },
      take: 5
    });
  }
}

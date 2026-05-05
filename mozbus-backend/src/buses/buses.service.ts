import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { plate: string; model: string; capacity: number; companyId?: string }, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      let targetCompanyId = data.companyId;
      if (user.role === 'COMPANY_ADMIN') {
        targetCompanyId = user.companyId; 
      }

      if (!targetCompanyId) throw new BadRequestException('Empresa não identificada.');

      return tx.bus.create({ 
        data: { ...data, companyId: targetCompanyId, status: 'ACTIVE' } 
      });
    });
  }

  async findAll(user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      return tx.bus.findMany({ include: { company: true } });
    });
  }

  async findByCompany(companyId: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      return tx.bus.findMany({ 
        where: { companyId },
        include: { company: true } 
      });
    });
  }

  async findOne(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const bus = await tx.bus.findUnique({ where: { id } });
      if (!bus) throw new NotFoundException('Ônibus não encontrado ou acesso negado.');
      return bus;
    });
  }

  async update(id: string, data: any, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const exists = await tx.bus.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Ônibus não encontrado ou acesso negado.');

      return tx.bus.update({ where: { id }, data });
    });
  }

  async remove(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const exists = await tx.bus.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Ônibus não encontrado ou acesso negado.');

      return tx.bus.delete({ where: { id } });
    });
  }
}

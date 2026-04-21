import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { plate: string; model: string; capacity: number; companyId: string }) {
    return this.prisma.bus.create({ data: { ...data, status: 'ACTIVE' } });
  }

  async findAll() {
    return this.prisma.bus.findMany({ include: { company: true } });
  }

  async findByCompany(companyId: string) {
    return this.prisma.bus.findMany({ where: { companyId } });
  }

  async findOne(id: string) {
    const bus = await this.prisma.bus.findUnique({ where: { id } });
    if (!bus) throw new NotFoundException('Ônibus não encontrado');
    return bus;
  }

  async update(id: string, data: any) {
    return this.prisma.bus.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.bus.delete({ where: { id } });
  }
}

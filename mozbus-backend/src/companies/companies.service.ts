import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const exists = await this.prisma.company.findUnique({
      where: { nuit: data.nuit }
    });

    if (exists) {
      throw new ConflictException('Uma empresa com este NUIT já existe.');
    }

    return this.prisma.company.create({
      data: {
        name: data.name,
        nuit: data.nuit,
        status: 'PENDING', // Conforme o PDF, entra como pendente
        adminId: data.adminId,
      }
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { buses: true, _count: true }
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { buses: true, routes: true }
    });
    if (!company) throw new NotFoundException('Empresa não encontrada.');
    return company;
  }
}

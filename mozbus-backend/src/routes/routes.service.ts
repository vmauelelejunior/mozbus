import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}
  
  async create(data: { origin: string; destination: string; distanceKm?: number; companyId: string }) {
    return this.prisma.route.create({ data });
  }

  async findAll() {
    return this.prisma.route.findMany({ include: { company: true } });
  }

  async findByCompany(companyId: string) {
    return this.prisma.route.findMany({ where: { companyId } });
  }

  async findOne(id: string) {
    return this.prisma.route.findUnique({ where: { id } });
  }

  async update(id: string, data: { origin?: string; destination?: string; distanceKm?: number }) {
    return this.prisma.route.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.route.delete({ where: { id } });
  }
}

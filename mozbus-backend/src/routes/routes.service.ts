import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}
  
  async create(data: any, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
        let targetCompanyId = data.companyId;

        if (user.role === 'COMPANY_ADMIN') {
            if (!user.companyId) throw new Error('Acesso negado: Administrador sem empresa.');
            targetCompanyId = user.companyId;
        }

        if (!targetCompanyId) {
            throw new Error('É obrigatório informar a companyId.');
        }

        // Parsing robusto de distância (ex: "1100 KM" -> 1100)
        let distanceKm = null;
        if (data.distance) {
            const numericValue = parseFloat(data.distance.toString().replace(/[^\d.]/g, ''));
            if (!isNaN(numericValue)) distanceKm = numericValue;
        } else if (data.distanceKm) {
            distanceKm = parseFloat(data.distanceKm.toString());
        }

        return tx.route.create({ 
            data: { 
                origin: data.origin,
                destination: data.destination,
                distanceKm: distanceKm,
                duration: data.duration || null,
                companyId: targetCompanyId 
            } 
        });
    });
  }

  async findAll(user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
        const where: any = {};
        if (user.role === 'COMPANY_ADMIN') {
            where.companyId = user.companyId;
        }
        return tx.route.findMany({ where, include: { company: true } });
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.route.findMany({ where: { companyId } });
  }

  async findOne(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
        const where: any = { id };
        if (user.role === 'COMPANY_ADMIN') {
            where.companyId = user.companyId;
        }
        return tx.route.findUnique({ where });
    });
  }

  async update(id: string, data: { origin?: string; destination?: string; distanceKm?: number }, user: any) {
    const where: any = { id };
    if (user.role === 'COMPANY_ADMIN') {
        where.companyId = user.companyId;
    }
    // Verify first
    const existing = await this.prisma.route.findUnique({ where });
    if (!existing) throw new Error('Rota não encontrada ou não permitida');

    return this.prisma.route.update({ where: { id }, data });
  }

  async remove(id: string, user: any) {
    const where: any = { id };
    if (user.role === 'COMPANY_ADMIN') {
        where.companyId = user.companyId;
    }
    // Verify first
    const existing = await this.prisma.route.findUnique({ where });
    if (!existing) throw new Error('Rota não encontrada ou não permitida');

    return this.prisma.route.delete({ where: { id } });
  }
}

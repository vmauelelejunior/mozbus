import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, user: any) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Apenas o CEO pode registar novas operadoras.');
    }

    const { name, nuit, email, phone, username, password } = data;

    if (!email || !username || !password) {
      throw new BadRequestException('Dados do administrador (email, username, password) são obrigatórios.');
    }

    return this.prisma.runAsUser(user, async (tx) => {
      // 1. Verificar se a empresa já existe
      const companyExists = await tx.company.findUnique({
        where: { nuit }
      });

      if (companyExists) {
        throw new ConflictException('Uma empresa com este NUIT já existe.');
      }

      // 2. Verificar se o utilizador já existe
      const userExists = await tx.user.findFirst({
        where: {
          OR: [{ email }, { username }, { phone: phone || 'N/A' }]
        }
      });

      if (userExists) {
        throw new ConflictException('O e-mail, username ou telefone já está em uso por outro utilizador.');
      }

      // 3. Criar o utilizador administrador (sem companyId ainda)
      const hashedPassword = await bcrypt.hash(password, 12);
      const adminUser = await tx.user.create({
        data: {
          name: `${name} (Admin)`,
          email,
          username,
          phone: phone || `000-${nuit}`, // Fallback se o front não enviar phone ainda
          password: hashedPassword,
          role: 'COMPANY_ADMIN'
        }
      });

      // 4. Criar a empresa associada ao admin
      const company = await tx.company.create({
        data: {
          name,
          nuit,
          status: 'ACTIVE',
          adminId: adminUser.id,
          plan: 'ELITE' // Plano default para novas empresas no ecossistema
        }
      });

      // 5. Vincular o utilizador à empresa
      await tx.user.update({
        where: { id: adminUser.id },
        data: { companyId: company.id }
      });

      return company;
    });
  }

  async findAll(user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const companies = await tx.company.findMany({
        include: { 
          buses: { select: { id: true } },
          hardware: { select: { id: true, type: true, serialNumber: true } },
          admin: { select: { name: true, phone: true } },
          _count: {
            select: {
              buses: true,
              routes: true,
              employees: true
            }
          }
        }
      });

      // Aggregate revenue and trips for each company
      const enhancedCompanies = await Promise.all(companies.map(async (company: any) => {
        // Total Revenue (PAID tickets)
        const revenueAgg = await tx.ticket.aggregate({
          where: {
            status: 'PAID',
            trip: {
              bus: { companyId: company.id }
            }
          },
          _sum: { amountPaid: true }
        });

        // Daily Trips (last 24h)
        const dayAgo = new Date();
        dayAgo.setHours(dayAgo.getHours() - 24);
        
        const dailyTrips = await tx.trip.count({
          where: {
            bus: { companyId: company.id },
            departureTime: { gte: dayAgo }
          }
        });

        return {
          ...company,
          stats: {
            revenue: Number(revenueAgg._sum.amountPaid || 0),
            dailyTrips,
            fleetSize: company.buses.length,
            hardwareCount: company.hardware.length
          }
        };
      }));

      return enhancedCompanies;
    });
  }

  async findOne(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const company = await tx.company.findUnique({
        where: { id },
        include: { buses: true, routes: true }
      });
      if (!company) throw new NotFoundException('Empresa não encontrada ou acesso negado.');
      return company;
    });
  }

  async updateStatus(id: string, status: any) {
      return this.prisma.company.update({
          where: { id },
          data: { status }
      });
  }

  async updatePlan(id: string, plan: any) {
      return this.prisma.company.update({
          where: { id },
          data: { plan }
      });
  }
}

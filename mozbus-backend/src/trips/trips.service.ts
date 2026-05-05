import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async search(query: { origin: string; destination: string; date?: string }) {
    const where: any = {
      route: {
        origin: { contains: query.origin },
        destination: { contains: query.destination },
      },
      status: 'SCHEDULED',
      bus: {
         company: {
             status: 'ACTIVE' // Oculta viagens de empresas suspensas
         }
      }
    };

    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(query.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    return this.prisma.trip.findMany({
      where,
      select: {
        id: true,
        departureTime: true,
        price: true,
        status: true,
        // Ignoramos seatsMapping para reduzir o payload no search
        route: {
          select: {
            origin: true,
            destination: true
          }
        },
        bus: {
          select: {
            plate: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { departureTime: 'asc' }
    });
  }

  async findAll(user: any, targetCompanyId?: string) {
    return this.prisma.runAsUser(user, async (tx) => {
        const where: any = {};
        if (user.role === 'COMPANY_ADMIN') {
            where.bus = { companyId: user.companyId };
        } else if (user.role === 'SUPER_ADMIN' && targetCompanyId) {
            where.bus = { companyId: targetCompanyId };
        }
        
        return tx.trip.findMany({
            where,
            include: {
                route: true,
                bus: { include: { company: true } },
                tickets: true
            },
            orderBy: { departureTime: 'desc' }
        });
    });
  }

  async findOne(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const where: any = { id };
      
      if (user && user.role === 'COMPANY_ADMIN') {
          where.bus = { companyId: user.companyId };
      }

      const trip = await tx.trip.findFirst({
        where,
        include: {
          route: true,
          bus: { include: { company: true } },
          tickets: {
            include: { passenger: true }
          }
        }
      });
      if (!trip) throw new NotFoundException('Viagem não encontrada ou acesso restrito.');
      return trip;
    });
  }

  // Método para atualizar o mapa de assentos
  async updateSeats(tripId: string, seatNumber: number, user: any) {
     return this.prisma.runAsUser(user, async (tx) => {
       const trip = await this.findOne(tripId, user);
       
       let seats: any[] = [];
       if (trip.seatsMapping) {
         if (typeof trip.seatsMapping === 'string') {
           try {
             seats = JSON.parse(trip.seatsMapping);
             if (typeof seats === 'string') seats = JSON.parse(seats);
           } catch (e) {
             seats = [];
           }
         } else {
           seats = trip.seatsMapping as any[];
         }
       }
       if (!Array.isArray(seats)) seats = [];
       
       if (seats[seatNumber - 1] === true || seats[seatNumber - 1] === 'true') {
           throw new BadRequestException('Este assento já está ocupado.');
       }

       seats[seatNumber - 1] = true;
       
       return tx.trip.update({
           where: { id: tripId },
           data: { seatsMapping: seats as any }
       });
     });
  }

  async create(data: { departureTime: Date, price: number, busId: string, routeId: string }, user: any) {
      
      // Validação de Segurança do Tenant:
      if (user.role === 'COMPANY_ADMIN') {
        const bus = await this.prisma.bus.findUnique({ where: { id: data.busId } });
        if (!bus || bus.companyId !== user.companyId) {
            throw new BadRequestException('Acesso negado: Este autocarro não pertence à sua frota.');
        }
      }

      const busReference = await this.prisma.bus.findUnique({ where: { id: data.busId } });
      const seatsCount = busReference?.capacity || 40;

      return this.prisma.trip.create({
          data: {
              ...data,
              status: 'SCHEDULED',
              seatsMapping: new Array(seatsCount).fill(false) as any
          }
      });
  }
}

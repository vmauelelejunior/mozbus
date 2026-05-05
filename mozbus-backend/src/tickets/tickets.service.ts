import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async bookTicket(data: { 
    tripId: string; 
    seatNumber: number; 
    passengerId: string;
    luggages?: { type: string; weight?: number; description?: string; price: number }[]
  }, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      // 1. Buscar a viagem
      const trip = await tx.trip.findUnique({
        where: { id: data.tripId },
        include: { bus: true }
      });

      if (!trip) throw new BadRequestException('Viagem não encontrada.');

      // 2. Verificar assento
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

      if (seats[data.seatNumber - 1] === true || seats[data.seatNumber - 1] === 'true') {
        throw new BadRequestException('Assento já ocupado.');
      }

      // 3. Marcar assento como ocupado
      seats[data.seatNumber - 1] = true;
      await tx.trip.update({
        where: { id: data.tripId },
        data: { seatsMapping: seats as any }
      });

      // 4. Calcular preço total (Passagem + Bagagens)
      const luggageTotal = data.luggages?.reduce((acc, lug) => acc + Number(lug.price), 0) || 0;

      // 5. Criar o Bilhete com Bagagens
      return tx.ticket.create({
        data: {
          qrCode: `MOZ-${uuidv4().substring(0, 8).toUpperCase()}`,
          seatNumber: data.seatNumber,
          status: 'PENDING_PAYMENT',
          isBoarded: false,
          passengerId: data.passengerId,
          tripId: data.tripId,
          amountPaid: Number(trip.price) + luggageTotal,
          ...(data.luggages && data.luggages.length > 0 ? {
            luggages: {
              create: data.luggages.map(lug => ({
                type: lug.type,
                weight: lug.weight,
                description: lug.description,
                price: lug.price
              }))
            }
          } : {})
        },
        include: {
          luggages: true,
          passenger: true,
          trip: {
            include: {
              route: true,
              bus: { include: { company: true } }
            }
          }
        }
      });
    });
  }

  async payTicket(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const ticket = await tx.ticket.findUnique({ where: { id } });
      if (!ticket) throw new BadRequestException('Bilhete não encontrado.');
      
      return tx.ticket.update({
        where: { id },
        data: { 
          status: 'PAID',
          amountPaid: (await tx.trip.findUnique({ where: { id: ticket.tripId } }))?.price
        },
        include: {
          trip: { include: { route: true, bus: { include: { company: true } } } },
          passenger: true
        }
      });
    });
  }

  async scanTicket(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode }
    });

    if (!ticket) throw new BadRequestException('Bilhete inválido ou não encontrado.');
    if (ticket.isBoarded) throw new BadRequestException('Este bilhete já foi utilizado para embarque.');

    return this.prisma.ticket.update({
      where: { qrCode },
      data: {
        isBoarded: true,
        boardedAt: new Date(),
        status: 'USED'
      },
      include: {
          passenger: true,
          trip: { include: { route: true } }
      }
    });
  }

  async findOne(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      return tx.ticket.findUnique({
        where: { id },
        include: {
          trip: {
              include: {
                  route: true,
                  bus: { include: { company: true } }
              }
          },
          passenger: true
        }
      });
    });
  }

  async findByUser(userId: string) {
    return this.prisma.ticket.findMany({
      where: { passengerId: userId },
      include: {
        trip: {
            include: {
                route: true,
                bus: true
            }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(user: any, targetCompanyId?: string) {
    return this.prisma.runAsUser(user, async (tx) => {
        const where: any = {};
        if (user.role === 'COMPANY_ADMIN') {
            where.trip = {
                bus: { companyId: user.companyId }
            };
        } else if (user.role === 'SUPER_ADMIN' && targetCompanyId) {
            where.trip = {
                bus: { companyId: targetCompanyId }
            };
        }
        
        return tx.ticket.findMany({
            where,
            include: {
                trip: {
                    include: {
                        route: true,
                        bus: { include: { company: true } }
                    }
                },
                passenger: true,
                luggages: true
            },
            orderBy: { createdAt: 'desc' }
        });
    });
  }

  async cancelTicket(id: string, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id },
        include: { trip: true }
      });

      if (!ticket) throw new BadRequestException('Bilhete não encontrado.');
      if (ticket.status === 'USED') throw new BadRequestException('Não é possível cancelar um bilhete já utilizado.');

      // Libertar o lugar no mapeamento da viagem
      const trip = ticket.trip;
      let seats: any[] = [];
      if (trip.seatsMapping) {
        try {
          seats = typeof trip.seatsMapping === 'string' ? JSON.parse(trip.seatsMapping) : (trip.seatsMapping as any[]);
          if (typeof seats === 'string') seats = JSON.parse(seats);
        } catch (e) { seats = []; }
      }
      
      if (seats[ticket.seatNumber - 1] === true || seats[ticket.seatNumber - 1] === 'true') {
        seats[ticket.seatNumber - 1] = false;
        await tx.trip.update({
          where: { id: trip.id },
          data: { seatsMapping: seats as any }
        });
      }

      // Se for PENDING_PAYMENT, podemos apagar. Se for PAID, marcamos como CANCELLED.
      if (ticket.status === 'PENDING_PAYMENT') {
        return tx.ticket.delete({ where: { id } });
      } else {
        return tx.ticket.update({
          where: { id },
          data: { status: 'CANCELLED' }
        });
      }
    });
  }

  async updateTicketSeat(id: string, newSeatNumber: number, user: any) {
    return this.prisma.runAsUser(user, async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id },
        include: { trip: true }
      });

      if (!ticket) throw new BadRequestException('Bilhete não encontrado.');
      if (ticket.status !== 'PENDING_PAYMENT') throw new BadRequestException('Apenas bilhetes pendentes podem ser editados.');

      const trip = ticket.trip;
      let seats: any[] = [];
      try {
        seats = typeof trip.seatsMapping === 'string' ? JSON.parse(trip.seatsMapping) : (trip.seatsMapping as any[]);
        if (typeof seats === 'string') seats = JSON.parse(seats);
      } catch (e) { seats = []; }

      // 1. Verificar se o novo lugar está livre
      if (seats[newSeatNumber - 1] === true || seats[newSeatNumber - 1] === 'true') {
        throw new BadRequestException('O novo assento já está ocupado.');
      }

      // 2. Libertar lugar antigo
      seats[ticket.seatNumber - 1] = false;
      // 3. Ocupar lugar novo
      seats[newSeatNumber - 1] = true;

      await tx.trip.update({
        where: { id: trip.id },
        data: { seatsMapping: seats as any }
      });

      return tx.ticket.update({
        where: { id },
        data: { seatNumber: newSeatNumber }
      });
    });
  }
}

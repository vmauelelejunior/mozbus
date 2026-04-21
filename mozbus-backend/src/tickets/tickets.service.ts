import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async bookTicket(data: { tripId: string; seatNumber: number; passengerId: string }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buscar a viagem
      const trip = await tx.trip.findUnique({
        where: { id: data.tripId },
        include: { bus: true }
      });

      if (!trip) throw new BadRequestException('Viagem não encontrada.');

      // 2. Verificar assento
      const seats = JSON.parse(trip.seatsMapping || '[]');
      if (seats[data.seatNumber - 1] === true) {
        throw new BadRequestException('Assento já ocupado.');
      }

      // 3. Marcar assento como ocupado
      seats[data.seatNumber - 1] = true;
      await tx.trip.update({
        where: { id: data.tripId },
        data: { seatsMapping: JSON.stringify(seats) }
      });

      // 4. Criar o Bilhete
      return tx.ticket.create({
        data: {
          qrCode: `MOZ-${uuidv4().substring(0, 8).toUpperCase()}`,
          seatNumber: data.seatNumber,
          status: 'PENDING_PAYMENT',
          isBoarded: false,
          passengerId: data.passengerId,
          tripId: data.tripId,
        },
        include: {
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

  async payTicket(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new BadRequestException('Bilhete não encontrado.');
    
    return this.prisma.ticket.update({
      where: { id },
      data: { 
        status: 'PAID',
        amountPaid: (await this.prisma.trip.findUnique({ where: { id: ticket.tripId } }))?.price
      },
      include: {
        trip: { include: { route: true, bus: { include: { company: true } } } },
        passenger: true
      }
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

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({
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
}

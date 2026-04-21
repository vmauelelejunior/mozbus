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
      status: 'SCHEDULED'
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
      include: {
        route: true,
        bus: {
            include: { company: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        route: true,
        bus: { include: { company: true } },
        tickets: {
          include: { passenger: true }
        }
      }
    });
    if (!trip) throw new NotFoundException('Viagem não encontrada.');
    return trip;
  }

  // Método para atualizar o mapa de assentos
  async updateSeats(tripId: string, seatNumber: number) {
     const trip = await this.findOne(tripId);
     const seats = JSON.parse(trip.seatsMapping || '[]');
     
     if (seats[seatNumber - 1] === true) {
         throw new BadRequestException('Este assento já está ocupado.');
     }

     seats[seatNumber - 1] = true;
     
     return this.prisma.trip.update({
         where: { id: tripId },
         data: { seatsMapping: JSON.stringify(seats) }
     });
  }

  async create(data: { departureTime: Date, price: number, busId: string, routeId: string }) {
      return this.prisma.trip.create({
          data: {
              ...data,
              status: 'SCHEDULED',
              seatsMapping: JSON.stringify(new Array(40).fill(false)) // Default 40 seats
          }
      });
  }
}

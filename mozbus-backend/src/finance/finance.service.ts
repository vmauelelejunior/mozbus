import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getGlobalStats() {
    const [tickets, transactions, companies] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { status: 'PAID' },
        include: { trip: true }
      }),
      this.prisma.transaction.findMany({
        where: { status: 'SUCCESS' }
      }),
      this.prisma.company.findMany()
    ]);

    const totalRevenue = tickets.reduce((acc, ticket) => acc + Number(ticket.trip.price), 0);
    
    // Calculate commission based on each company's rate
    // Note: In a real scenario, we'd join tickets with company through trip -> bus -> company
    // For simplicity here, we'll use a calculated average or perform a more complex query
    
    const companyStats = await Promise.all(companies.map(async (company) => {
      const companyTickets = await this.prisma.ticket.findMany({
        where: {
          status: 'PAID',
          trip: {
            bus: {
              companyId: company.id
            }
          }
        },
        include: { trip: true }
      });

      const revenue = companyTickets.reduce((acc, t) => acc + Number(t.trip.price), 0);
      const commission = revenue * company.commission;
      const net = revenue - commission;

      return {
        companyId: company.id,
        name: company.name,
        revenue,
        commission,
        net,
        ticketCount: companyTickets.length
      };
    }));

    const totalMozBusCommission = companyStats.reduce((acc, c) => acc + c.commission, 0);

    return {
      totalRevenue,
      totalMozBusCommission,
      netOperatorRevenue: totalRevenue - totalMozBusCommission,
      transactionCount: transactions.length,
      activeOperators: companies.length,
      companyStats
    };
  }

  async getTransactions(limit = 50) {
    return this.prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        ticket: {
          include: {
            trip: {
              include: {
                route: true,
                bus: { include: { company: true } }
              }
            }
          }
        }
      }
    });
  }
}

import { PrismaClient, UserRole, TripStatus, BusStatus, TicketStatus, AuraPlan } from '@prisma/client';
const prisma = new PrismaClient();
import * as bcrypt from 'bcrypt';

async function hashPassword(pass: string) {
  return bcrypt.hash(pass, 12);
}

const COMPANIES = [
  { name: 'Nagi Bus', nuit: '100200300', commission: 0.12, plan: AuraPlan.ELITE, prefix: 'NAG' },
  { name: 'Panthera Azul', nuit: '200300400', commission: 0.10, plan: AuraPlan.PREMIUM, prefix: 'PAN' },
  { name: 'Malaika Transportes', nuit: '300400500', commission: 0.08, plan: AuraPlan.BASIC, prefix: 'MAL' },
  { name: 'TCO Transportes', nuit: '400500600', commission: 0.15, plan: AuraPlan.ELITE, prefix: 'TCO' },
  { name: 'Intercape Moz', nuit: '500600700', commission: 0.10, plan: AuraPlan.PREMIUM, prefix: 'INT' }
];

const ROUTES = [
  { origin: 'Maputo', destination: 'Beira', dist: 1100 },
  { origin: 'Maputo', destination: 'Inhambane', dist: 450 },
  { origin: 'Maputo', destination: 'Xai-Xai', dist: 220 },
  { origin: 'Maputo', destination: 'Vilankulo', dist: 700 },
  { origin: 'Maputo', destination: 'Quelimane', dist: 1500 },
];

const BUS_MODELS = [
  { model: 'Yutong ZK6122H', cap: 44 },
  { model: 'Marcopolo G7', cap: 52 },
  { model: 'Scania Irizar i6', cap: 48 },
];

async function main() {
  console.log('🧹 Limpeza Atómica (Raw SQL)...');
  const tableNames = ['Luggage', 'Ticket', 'Trip', 'Route', 'Bus', 'Company', 'User'];
  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    } catch (e) {
      // Ignora se a tabela não existir ainda ou for diferente
    }
  }

  console.log('👥 Personas...');
  const password = await hashPassword('mozbus123');
  await prisma.user.create({
    data: { email: 'ceo@mozbus.mz', name: 'Director Executivo', phone: '840000000', password, role: UserRole.SUPER_ADMIN }
  });

  const adminIds = [];
  for (const c of COMPANIES) {
    const admin = await prisma.user.create({
      data: { email: `admin@${c.prefix.toLowerCase()}.mz`, name: `Admin ${c.name}`, phone: `84100000${COMPANIES.indexOf(c)}`, password, role: UserRole.COMPANY_ADMIN }
    });
    adminIds.push(admin.id);
  }

  const fiscalIds = [];
  for (let i = 0; i < 5; i++) {
    const f = await prisma.user.create({
      data: { email: `fiscal${i}@mozbus.mz`, name: `Fiscal ${i}`, phone: `84200000${i}`, password, role: UserRole.FISCAL }
    });
    fiscalIds.push(f.id);
  }

  const passengers = [];
  for (let i = 0; i < 20; i++) {
    const p = await prisma.user.create({
      data: { email: `user${i}@gmail.com`, name: `Passageiro ${i}`, phone: `84300000${i}`, password, role: UserRole.PASSENGER }
    });
    passengers.push(p);
  }

  console.log('🏢 Empresas e Frotas...');
  const companyInstances = [];
  for (let i = 0; i < COMPANIES.length; i++) {
    const c = await prisma.company.create({
      data: {
        name: COMPANIES[i].name,
        nuit: COMPANIES[i].nuit,
        plan: COMPANIES[i].plan,
        commission: COMPANIES[i].commission,
        adminId: adminIds[i],
        status: 'ACTIVE'
      }
    });
    companyInstances.push(c);

    // VINCULAR ADMIN À EMPRESA (Crucial para RLS e Token)
    await prisma.user.update({
      where: { id: adminIds[i] },
      data: { companyId: c.id }
    });

    // Frotas (3 buses per company)
    for (let j = 0; j < 3; j++) {
      await prisma.bus.create({
        data: {
          plate: `${COMPANIES[i].prefix}-${100 + j}-MZ`,
          model: BUS_MODELS[j % BUS_MODELS.length].model,
          capacity: BUS_MODELS[j % BUS_MODELS.length].cap,
          companyId: c.id,
          fiscalId: fiscalIds[j % fiscalIds.length]
        }
      });
    }
  }

  console.log('🗺️ Rotas e Operações (Revenue Seed)...');
  const buses = await prisma.bus.findMany();
  for (const c of companyInstances) {
    for (const rData of ROUTES.slice(0, 3)) {
      const route = await prisma.route.create({
        data: { 
          origin: rData.origin,
          destination: rData.destination, 
          distanceKm: rData.dist,
          companyId: c.id 
        }
      });

      const compBuses = buses.filter(b => b.companyId === c.id);
      for (let i = 0; i < 4; i++) {
        const departure = new Date();
        departure.setDate(departure.getDate() + (i - 2)); 

        const trip = await prisma.trip.create({
          data: {
            departureTime: departure,
            price: 600 + Math.random() * 400,
            status: departure < new Date() ? TripStatus.COMPLETED : TripStatus.SCHEDULED,
            busId: compBuses[i % compBuses.length].id,
            routeId: route.id,
            seatsMapping: JSON.stringify(Array(compBuses[i % compBuses.length].capacity).fill(false))
          }
        });

        const numTickets = 10 + Math.floor(Math.random() * 15);
        const tickets = [];
        for (let t = 0; t < numTickets; t++) {
          tickets.push({
            qrCode: `MZ-${trip.id.substring(0,4)}-${i}-${t}-${Math.random().toString(36).substring(2,4)}`.toUpperCase(),
            seatNumber: t + 1,
            status: TicketStatus.PAID,
            passengerId: passengers[Math.floor(Math.random() * passengers.length)].id,
            tripId: trip.id,
            amountPaid: trip.price,
            isBoarded: trip.status === TripStatus.COMPLETED
          });
        }
        await prisma.ticket.createMany({ data: tickets });
      }
    }
  }

  console.log('🚀 ECOSSISTEMA MOZBUS PLANTADO COM SUCESSO!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

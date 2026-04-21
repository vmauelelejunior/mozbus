import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as bcrypt from 'bcrypt';

async function hashPassword(pass: string) {
  return bcrypt.hash(pass, 12);
}

async function main() {
  console.log('🌱 Semeando dados iniciais...');

  // 1. Criar Utilizadores Primeiro (com passwords hashed)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@mozbus.mz' },
      update: {},
      create: { email: 'admin@mozbus.mz', name: 'Admin MozBus', phone: '840000001', password: await hashPassword('admin123'), role: 'SUPER_ADMIN' }
    }),
    prisma.user.upsert({
      where: { email: 'gestor@nagibus.mz' },
      update: {},
      create: { email: 'gestor@nagibus.mz', name: 'Carlos Matsinhe', phone: '840000002', password: await hashPassword('gestor123'), role: 'COMPANY_ADMIN' }
    }),
    prisma.user.upsert({
      where: { email: 'fiscal@nagibus.mz' },
      update: {},
      create: { email: 'fiscal@nagibus.mz', name: 'João Mandlate', phone: '840000003', password: await hashPassword('fiscal123'), role: 'FISCAL' }
    }),
    prisma.user.upsert({
      where: { email: 'passageiro@mozbus.mz' },
      update: {},
      create: { email: 'passageiro@mozbus.mz', name: 'Maria Sousa', phone: '840000004', password: await hashPassword('passageiro123'), role: 'PASSENGER' }
    })
  ]);

  // 2. Criar Empresas (com admin)
  const company1 = await prisma.company.upsert({
    where: { nuit: '100200300' },
    update: {},
    create: {
      name: 'Nagi Bus',
      nuit: '100200300',
      status: 'ACTIVE',
      commission: 10,
      adminId: users[1].id
    }
  });

  const company2 = await prisma.company.upsert({
    where: { nuit: '200300400' },
    update: {},
    create: {
      name: 'Panthera Azul',
      nuit: '200300400',
      status: 'ACTIVE',
      commission: 15,
      adminId: users[1].id
    }
  });

  // 3. Criar Autocarros (3 por empresa) - upsert para evitar duplicados
  const buses = await Promise.all([
    prisma.bus.upsert({ where: { plate: 'AFG-123-MC' }, update: {}, create: { plate: 'AFG-123-MC', model: 'Yutong ZK6122H', capacity: 40, companyId: company1.id, status: 'ACTIVE' } }),
    prisma.bus.upsert({ where: { plate: 'AFG-456-MC' }, update: {}, create: { plate: 'AFG-456-MC', model: 'King Long XMQ6127', capacity: 45, companyId: company1.id, status: 'ACTIVE' } }),
    prisma.bus.upsert({ where: { plate: 'AFG-789-MC' }, update: {}, create: { plate: 'AFG-789-MC', model: 'Higer KLQ6129', capacity: 50, companyId: company1.id, status: 'ACTIVE' } }),
    prisma.bus.upsert({ where: { plate: 'BEB-001-BS' }, update: {}, create: { plate: 'BEB-001-BS', model: 'Volvo 9700', capacity: 42, companyId: company2.id, status: 'ACTIVE' } }),
    prisma.bus.upsert({ where: { plate: 'BEB-002-BS' }, update: {}, create: { plate: 'BEB-002-BS', model: 'Scania HD', capacity: 48, companyId: company2.id, status: 'ACTIVE' } }),
    prisma.bus.upsert({ where: { plate: 'BEB-003-BS' }, update: {}, create: { plate: 'BEB-003-BS', model: 'Mercedes Sprinter', capacity: 20, companyId: company2.id, status: 'ACTIVE' } })
  ]);

  // 4. Criar Rotas
  const routesData = [
    { origin: 'Maputo', destination: 'Beira', distanceKm: 1100 },
    { origin: 'Maputo', destination: 'Inhambane', distanceKm: 450 },
    { origin: 'Maputo', destination: 'Xai-Xai', distanceKm: 220 },
    { origin: 'Beira', destination: 'Chimoio', distanceKm: 310 },
    { origin: 'Maputo', destination: 'Gaza', distanceKm: 380 },
    { origin: 'Maputo', destination: 'Tete', distanceKm: 1200 },
    { origin: 'Beira', destination: 'Quelimane', distanceKm: 350 }
  ];
  
  const routes = await Promise.all(routesData.map((r, i) => 
    prisma.route.upsert({ 
      where: { id: `route-${i}` }, 
      update: {}, 
      create: { ...r, id: `route-${i}`, companyId: i < 4 ? company1.id : company2.id } 
    })
  ));

  // 5. Criar Viagens (10+ viagens)
  const statuses = ['SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED'];
  const trips: any[] = [];

  for (let i = 0; i < 12; i++) {
    const tripDate = new Date();
    tripDate.setDate(tripDate.getDate() + (i < 8 ? i - 2 : i - 10));
    tripDate.setHours(6 + i, 0, 0, 0);

    const trip = await prisma.trip.create({
      data: {
        departureTime: tripDate,
        price: 500 + Math.floor(Math.random() * 2500),
        status: i < 4 ? 'SCHEDULED' : i < 8 ? statuses[i % 4] : 'COMPLETED',
        busId: buses[i % buses.length].id,
        routeId: routes[i % routes.length].id,
        seatsMapping: JSON.stringify(Array(40).fill(false))
      }
    });
    trips.push(trip);

    // Alguns bilhetes para viagens passadas
    if (i >= 4) {
      for (let j = 0; j < Math.floor(Math.random() * 15) + 5; j++) {
        await prisma.ticket.create({
          data: {
            qrCode: `MOZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            seatNumber: j + 1,
            status: i >= 8 ? 'USED' : 'PAID',
            isBoarded: i >= 8,
            passengerId: users[3].id,
            tripId: trip.id
          }
        });
      }
    }
  }

  console.log('✅ Dados semeados com sucesso!');
  console.log('📧 Contas demo: admin@mozbus.mz / gestor@nagibus.mz / fiscal@nagibus.mz / passageiro@mozbus.mz');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

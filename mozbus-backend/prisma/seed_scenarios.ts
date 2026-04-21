import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as bcrypt from 'bcrypt';

async function hashPassword(pass: string) {
  return bcrypt.hash(pass, 12);
}

const COMPANIES = [
  { name: 'Nagi Bus', nuit: '100200300', commission: 0.10 },
  { name: 'Panthera Azul', nuit: '200300400', commission: 0.12 },
  { name: 'Malaika Transportes', nuit: '300400500', commission: 0.08 },
  { name: 'Tco Transportes', nuit: '400500600', commission: 0.15 },
  { name: 'Intercape Moz', nuit: '500600700', commission: 0.10 }
];

const ROUTES = [
  { origin: 'Maputo', destination: 'Beira', dist: 1100 },
  { origin: 'Maputo', destination: 'Inhambane', dist: 450 },
  { origin: 'Maputo', destination: 'Xai-Xai', dist: 220 },
  { origin: 'Maputo', destination: 'Vilankulo', dist: 700 },
  { origin: 'Maputo', destination: 'Quelimane', dist: 1500 },
  { origin: 'Maputo', destination: 'Tete', dist: 1600 },
  { origin: 'Maputo', destination: 'Nampula', dist: 2100 },
  { origin: 'Maputo', destination: 'Pemba', dist: 2400 },
  { origin: 'Beira', destination: 'Chimoio', dist: 200 },
  { origin: 'Beira', destination: 'Tete', dist: 600 },
  { origin: 'Nampula', destination: 'Ilha de Moçambique', dist: 180 },
  { origin: 'Nampula', destination: 'Pemba', dist: 400 },
  { origin: 'Maxixe', destination: 'Inhambane', dist: 30 },
];

const BUS_MODELS = [
  { model: 'Yutong ZK6122H', cap: 40 },
  { model: 'Marcopolo G7', cap: 52 },
  { model: 'Scania Irizar i6', cap: 48 },
  { model: 'King Long XMQ6127', cap: 45 },
  { model: 'Mercedes Sprinter', cap: 19 },
  { model: 'Toyota Coaster', cap: 28 }
];

async function main() {
  console.log('🎭 Plantando Cenários Operacionais MozBus...');

  // 1. Limpeza (Opcional, mas mantemos upsert para segurança)
  const password = await hashPassword('mozbus123');

  // 2. Administradores
  console.log('👥 Criando Personas do Sistema...');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'ceo@mozbus.mz' },
    update: {},
    create: { email: 'ceo@mozbus.mz', name: 'Director Executivo', phone: '841112233', password, role: 'SUPER_ADMIN' }
  });

  const admins = [];
  for (let i = 0; i < COMPANIES.length; i++) {
    const admin = await prisma.user.upsert({
      where: { email: `gestor${i+1}@${COMPANIES[i].name.toLowerCase().replace(' ', '')}.mz` },
      update: {},
      create: { 
        email: `gestor${i+1}@${COMPANIES[i].name.toLowerCase().replace(' ', '')}.mz`, 
        name: `Gestor ${COMPANIES[i].name}`, 
        phone: `84900000${i}`, 
        password, 
        role: 'COMPANY_ADMIN' 
      }
    });
    admins.push(admin);
  }

  // 3. Fiscais
  const fiscals = [];
  for (let i = 0; i < 10; i++) {
    const fiscal = await prisma.user.upsert({
      where: { email: `fiscal${i+1}@mozbus.mz` },
      update: {},
      create: { 
        email: `fiscal${i+1}@mozbus.mz`, 
        name: `Agente Fiscal ${i+1}`, 
        phone: `84800000${i}`, 
        password, 
        role: 'FISCAL' 
      }
    });
    fiscals.push(fiscal);
  }

  // 4. Passageiros
  const passengers = [];
  for (let i = 0; i < 20; i++) {
    const pass = await prisma.user.upsert({
      where: { email: `passageiro${i+1}@gmail.com` },
      update: {},
      create: { 
        email: `passageiro${i+1}@gmail.com`, 
        name: `Cliente Premium ${i+1}`, 
        phone: `82700000${i}`, 
        password, 
        role: 'PASSENGER' 
      }
    });
    passengers.push(pass);
  }

  // 5. Empresas
  console.log('🏢 Estabelecendo Operadores de Transporte...');
  const companyEntities = [];
  for (let i = 0; i < COMPANIES.length; i++) {
    const comp = await prisma.company.upsert({
      where: { nuit: COMPANIES[i].nuit },
      update: {},
      create: {
        name: COMPANIES[i].name,
        nuit: COMPANIES[i].nuit,
        commission: COMPANIES[i].commission,
        adminId: admins[i].id
      }
    });
    companyEntities.push(comp);
  }

  // 6. Frotas
  console.log('🚌 Comissionando Frotas...');
  const allBuses = [];
  for (const comp of companyEntities) {
    const numBuses = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numBuses; i++) {
      const model = BUS_MODELS[Math.floor(Math.random() * BUS_MODELS.length)];
      const plate = `ABC-${Math.floor(Math.random() * 999)}-${comp.name.substring(0, 2).toUpperCase()}`;
      const bus = await prisma.bus.upsert({
        where: { plate },
        update: {},
        create: {
          plate,
          model: model.model,
          capacity: model.cap,
          companyId: comp.id,
          status: Math.random() > 0.1 ? 'ACTIVE' : 'MAINTENANCE',
          fiscalId: fiscals[Math.floor(Math.random() * fiscals.length)].id
        }
      });
      allBuses.push(bus);
    }
  }

  // 7. Rotas
  console.log('🗺️ Mapeando Rede Nacional...');
  const allRoutes = [];
  for (const route of ROUTES) {
    const comp = companyEntities[Math.floor(Math.random() * companyEntities.length)];
    const r = await prisma.route.create({
      data: {
        origin: route.origin,
        destination: route.destination,
        distanceKm: route.dist,
        companyId: comp.id
      }
    });
    allRoutes.push(r);
  }

  // 8. Viagens e Bilhetes (O Coração do Teste)
  console.log('🕒 Agendando Operações (Passado, Presente e Futuro)...');
  const statuses = ['SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED'];
  
  for (let i = 0; i < 50; i++) {
    const bus = allBuses[Math.floor(Math.random() * allBuses.length)];
    const route = allRoutes.find(r => r.companyId === bus.companyId) || allRoutes[0];
    
    // Distribuir viagens no tempo
    const departure = new Date();
    // i=0-10: Passado (Concluído)
    // i=11-20: Hoje (Em trânsito / Embarque)
    // i=21-50: Futuro (Agendado)
    if (i <= 10) {
      departure.setDate(departure.getDate() - (Math.floor(Math.random() * 10) + 1));
    } else if (i <= 20) {
      departure.setHours(departure.getHours() + (Math.floor(Math.random() * 6) - 3));
    } else {
      departure.setDate(departure.getDate() + (Math.floor(Math.random() * 20) + 1));
    }

    const price = 450 + (route.distanceKm || 100) * 1.5 + (Math.random() * 200);
    
    let status = 'SCHEDULED';
    if (i <= 10) status = 'COMPLETED';
    else if (i <= 15) status = 'IN_TRANSIT';
    else if (i <= 20) status = 'BOARDING';

    const trip = await prisma.trip.create({
      data: {
        departureTime: departure,
        price,
        status,
        busId: bus.id,
        routeId: route.id,
        seatsMapping: JSON.stringify(Array(bus.capacity).fill(false))
      }
    });

    // Plantar Bilhetes
    const numTickets = Math.floor(Math.random() * (bus.capacity * 0.8));
    for (let j = 0; j < numTickets; j++) {
      const passenger = passengers[Math.floor(Math.random() * passengers.length)];
      await prisma.ticket.create({
        data: {
          qrCode: `TKT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          seatNumber: j + 1,
          status: status === 'COMPLETED' ? 'USED' : 'PAID',
          isBoarded: status === 'COMPLETED' || status === 'IN_TRANSIT',
          boardedAt: (status === 'COMPLETED' || status === 'IN_TRANSIT') ? departure : null,
          passengerId: passenger.id,
          tripId: trip.id,
          amountPaid: price
        }
      });
    }
  }

  console.log('🌟 CENÁRIOS PLANTADOS COM SUCESSO!');
  console.log(`📉 Resumo: ${companyEntities.length} Empresas, ${allBuses.length} Autocarros, 50 Viagens Plantadas.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao plantar cenários:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

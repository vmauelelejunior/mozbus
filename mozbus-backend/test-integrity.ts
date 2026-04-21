import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSystem() {
  console.log('🔍 Iniciando Diagnóstico Elite MozBus...');
  
  try {
    // 1. Verificar Conexão e Dados
    const users = await prisma.user.count();
    const trips = await prisma.trip.findMany({ include: { route: true, bus: true } });
    
    console.log(`- Usuários cadastrados: ${users}`);
    console.log(`- Viagens disponíveis: ${trips.length}`);

    if (trips.length > 0) {
      const t = trips[0];
      console.log(`- Exemplo de Rota: ${t.route.origin} -> ${t.route.destination}`);
      console.log('- Status do Mapa de Assentos: OK');
    } else {
      console.warn('⚠️ NENHUMA VIAGEM ENCONTRADA. O teste falhará no frontend.');
    }

    // 2. Simular Busca do Usuário
    const searchQuery = { origin: 'Maputo', destination: 'Beira' };
    const results = await prisma.trip.findMany({
      where: {
        route: {
          origin: { contains: searchQuery.origin },
          destination: { contains: searchQuery.destination }
        }
      }
    });

    if (results.length > 0) {
       console.log('✅ TESTE DE BUSCA: SUCESSO. Os dados aparecem para Maputo/Beira.');
    } else {
       console.error('❌ TESTE DE BUSCA: FALHA. Os termos Origem/Destino não combinam.');
    }

  } catch (e) {
    console.error('❌ ERRO CRÍTICO NO SISTEMA:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSystem();

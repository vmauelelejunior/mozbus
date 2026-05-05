const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const hashedGestor = await bcrypt.hash('gestor123', 12);
  const hashedFiscal = await bcrypt.hash('fiscal123', 12);
  const hashedPassageiro = await bcrypt.hash('passageiro123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@mozbus.mz' },
    update: { password: hashedAdmin },
    create: { email: 'admin@mozbus.mz', name: 'Admin MozBus', phone: '840000001', password: hashedAdmin, role: 'SUPER_ADMIN' }
  });

  await prisma.user.upsert({
    where: { email: 'gestor@nagibus.mz' },
    update: { password: hashedGestor },
    create: { email: 'gestor@nagibus.mz', name: 'Carlos Matsinhe', phone: '840000002', password: hashedGestor, role: 'COMPANY_ADMIN' }
  });

  await prisma.user.upsert({
    where: { email: 'fiscal@nagibus.mz' },
    update: { password: hashedFiscal },
    create: { email: 'fiscal@nagibus.mz', name: 'João Mandlate', phone: '840000003', password: hashedFiscal, role: 'FISCAL' }
  });

  await prisma.user.upsert({
    where: { email: 'passageiro@mozbus.mz' },
    update: { password: hashedPassageiro },
    create: { email: 'passageiro@mozbus.mz', name: 'Maria Sousa', phone: '840000004', password: hashedPassageiro, role: 'PASSENGER' }
  });

  await prisma.user.upsert({
    where: { email: 'op_junta@mozbus.mz' },
    update: { password: hashedAdmin, username: 'op_junta' },
    create: { 
      email: 'op_junta@mozbus.mz', 
      username: 'op_junta', 
      name: 'Operador Junta 01', 
      phone: '840000005', 
      password: hashedAdmin, 
      role: 'COMPANY_ADMIN' 
    }
  });

  console.log('✅ Passwords atualizadas com sucesso!');
  console.log('   Passageiro: passageiro123');
  console.log('   Gestor: gestor123');
  console.log('   Fiscal: fiscal123');
  console.log('   Admin: admin123');

  await prisma.$disconnect();
}

main();
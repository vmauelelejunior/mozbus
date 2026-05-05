const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function check() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'op_junta@mozbus.mz' },
        { username: 'op_junta' }
      ]
    }
  });

  if (!user) {
    console.log('❌ Utilizador op_junta NÃO ENCONTRADO no banco de dados.');
    return;
  }

  console.log('✅ Utilizador encontrado:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Username:', user.username);
  console.log('   Role:', user.role);
  
  const isMatch = await bcrypt.compare('admin123', user.password);
  console.log('   Password "admin123" confere?', isMatch ? 'SIM' : 'NÃO');
}

check().finally(() => prisma.$disconnect());

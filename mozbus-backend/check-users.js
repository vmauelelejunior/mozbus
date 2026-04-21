const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'mozbus' } },
    select: { email: true, password: true }
  });
  
  console.log('Users found:', users.length);
  users.forEach(u => {
    console.log(`${u.email}: ${u.password.substring(0, 30)}...`);
  });
  
  await prisma.$disconnect();
}

main();
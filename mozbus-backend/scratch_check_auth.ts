import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function check() {
  const email = 'ceo@mozbus.mz';
  const pass = 'mozbus123';
  
  console.log(`Checking user: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.error('USER NOT FOUND!');
    return;
  }
  
  console.log(`User found: ${user.name} (Role: ${user.role})`);
  const match = await bcrypt.compare(pass, user.password);
  
  if (match) {
    console.log('PASSWORD MATCHES! ✅');
  } else {
    console.error('PASSWORD DOES NOT MATCH! ❌');
    console.log(`Hashed password in DB: ${user.password}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());

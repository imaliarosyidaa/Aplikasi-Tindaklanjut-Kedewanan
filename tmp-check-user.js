const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
(async () => {
  await prisma.$connect();
  const user = await prisma.user.findUnique({ where: { email: 'admin@dprd-jaksel.go.id' } });
  console.log(JSON.stringify(user, null, 2));
  await prisma.$disconnect();
})().catch(err => { console.error(err); process.exit(1); });

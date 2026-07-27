const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$queryRawUnsafe(
    `SELECT tablename, rowsecurity
     FROM pg_tables
     WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
     ORDER BY tablename`
  );
  console.table(result);

  const policies = await prisma.$queryRawUnsafe(
    `SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log('\nPolicies:');
  console.table(policies);
}
main().finally(() => prisma.$disconnect());

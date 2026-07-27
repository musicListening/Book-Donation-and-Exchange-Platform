const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const missing = ['OrderItem', 'Payment', 'PlatformReview', 'PointTransaction', 'Shipment', 'SystemConfig', 'Task', 'User'];
  for (const table of missing) {
    const policyName = `policy_all_${table.toLowerCase()}`;
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "${policyName}" ON "${table}"`);
    await prisma.$executeRawUnsafe(`CREATE POLICY "${policyName}" ON "${table}" USING (true) WITH CHECK (true)`);
    console.log(`Policy created on ${table}`);
  }

  const policies = await prisma.$queryRawUnsafe(
    `SELECT count(*) as total FROM pg_policies WHERE schemaname = 'public'`
  );
  console.log(`\nTotal policies: ${Number(policies[0].total)}`);
}
main().finally(() => prisma.$disconnect());

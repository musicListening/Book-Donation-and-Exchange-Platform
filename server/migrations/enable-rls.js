const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tables = [
  'AuditLog', 'BookCollection', 'BookItem', 'Cart', 'CartItem',
  'CraftListing', 'DeletedUser', 'DeliveryUpdate', 'Dispute',
  'DonationRequest', 'EventComment', 'EventLike', 'EventPost',
  'Level', 'MysteryBox', 'Notification', 'Order', 'OrderItem',
  'Payment', 'PlatformReview', 'PointTransaction', 'Shipment',
  'SystemConfig', 'Task', 'User'
];

async function main() {
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`
    );
    console.log(`RLS enabled on ${table}`);
  }

  for (const table of tables) {
    const policyName = `policy_all_${table.toLowerCase()}`;
    await prisma.$executeRawUnsafe(
      `DROP POLICY IF EXISTS "${policyName}" ON "${table}"`
    );
    await prisma.$executeRawUnsafe(
      `CREATE POLICY "${policyName}" ON "${table}" USING (true) WITH CHECK (true)`
    );
    console.log(`Permissive policy created on ${table}`);
  }

  console.log('\nRLS enabled on all tables with permissive policies.');
  console.log('To tighten: replace USING (true) with role-based checks.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

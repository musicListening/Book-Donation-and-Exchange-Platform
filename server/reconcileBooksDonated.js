/**
 * Reconcile User.booksDonated against verified donation history.
 *
 * The counter is incremented when staff verify a donation, but seeded accounts
 * had it written directly without matching DonationRequest rows, so the stored
 * value can sit well above what the history accounts for. The leaderboard ranks
 * on the stored counter, so this brings the two back in line.
 *
 * Dry run (prints what would change, touches nothing):
 *   node reconcileBooksDonated.js
 *
 * Apply the corrections:
 *   node reconcileBooksDonated.js --apply
 */

const { prisma } = require('./db');
const { calculateLevelByBooks } = require('./utils/pointsCalculator');

const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(APPLY ? '⚠️  APPLY mode — changes will be written\n' : '🔍 Dry run — no changes will be written\n');

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, booksDonated: true, level: true },
  });

  // Sum verifiedCount across each user's VERIFIED donations
  const verified = await prisma.donationRequest.groupBy({
    by: ['userId'],
    where: { status: 'VERIFIED' },
    _sum: { verifiedCount: true },
  });
  const derived = new Map(verified.map(d => [d.userId, d._sum.verifiedCount || 0]));

  const drifted = [];
  for (const u of users) {
    const actual = derived.get(u.id) || 0;
    if (actual !== u.booksDonated) drifted.push({ ...u, actual });
  }

  if (drifted.length === 0) {
    console.log('✅ Every account already matches its donation history.');
    return;
  }

  drifted.sort((a, b) => (b.booksDonated - b.actual) - (a.booksDonated - a.actual));

  console.log(`Found ${drifted.length} of ${users.length} accounts out of sync:\n`);
  for (const u of drifted) {
    const newLevel = await calculateLevelByBooks(u.actual);
    const levelNote = newLevel !== u.level ? `  level ${u.level} -> ${newLevel}` : '';
    console.log(
      `  ${u.name.trim().padEnd(24)} ${String(u.booksDonated).padStart(5)} -> ${String(u.actual).padStart(5)}${levelNote}`
    );

    if (APPLY) {
      await prisma.user.update({
        where: { id: u.id },
        data: { booksDonated: u.actual, level: newLevel },
      });
    }
  }

  const totalRemoved = drifted.reduce((sum, u) => sum + (u.booksDonated - u.actual), 0);
  console.log(`\nNet change across all accounts: ${totalRemoved > 0 ? '-' : '+'}${Math.abs(totalRemoved)} books`);
  console.log(APPLY ? '\n✅ Applied.' : '\nRe-run with --apply to write these changes.');
}

main()
  .catch(e => {
    console.error('Reconcile failed:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

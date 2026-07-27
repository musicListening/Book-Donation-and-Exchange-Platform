const { prisma } = require('./db');

async function testNotif() {
  const user = await prisma.user.findFirst();
  if (user) {
    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: 'Welcome to Real-Time!',
        message: 'This is a test notification to demonstrate that your real-time socket connection is working.',
      }
    });
    console.log('Test notification created!', notif);
  }
}
testNotif().finally(() => process.exit(0));

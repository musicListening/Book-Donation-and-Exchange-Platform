const { prisma } = require('./db.js');
console.log(Object.keys(prisma).filter(k => !k.startsWith('_')));

import prisma from '../src/lib/prisma.js';

async function main() {
  const session = await prisma.session.findUnique({
    where: { id: "bb2792a2-128a-42c3-9040-b3e92fe3c950" },
    include: { decisionLogs: true }
  });
  console.log("Session:", JSON.stringify(session, null, 2));
  await prisma.$disconnect();
}
main();

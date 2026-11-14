import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        decisionLogs: true,
        redTeamLogs: true,
        votes: true
      }
    });
    console.log("=== SESSIONS IN DB ===");
    console.log(JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

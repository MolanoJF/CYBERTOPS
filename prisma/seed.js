import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing benchmarks if any
  await prisma.benchmark.deleteMany({});

  const seedData = [
    // Banca
    { companyName: "Banco Alpha", industryKey: "BANCA", finalGci: 32.5, finalBrs: 3.4, finalDvs: 82 },
    { companyName: "Zurich Swiss", industryKey: "BANCA", finalGci: 45.0, finalBrs: 2.8, finalDvs: 75 },
    { companyName: "Apex Finanzas", industryKey: "BANCA", finalGci: 21.0, finalBrs: 4.0, finalDvs: 90 },
    { companyName: "Global Wealth", industryKey: "BANCA", finalGci: 58.0, finalBrs: 2.1, finalDvs: 60 },
    { companyName: "Nordic Bank", industryKey: "BANCA", finalGci: 75.2, finalBrs: 1.2, finalDvs: 50 },
    // Salud
    { companyName: "Pharma Global", industryKey: "SALUD", finalGci: 28.0, finalBrs: 3.6, finalDvs: 85 },
    { companyName: "Clinica Andes", industryKey: "SALUD", finalGci: 44.5, finalBrs: 2.8, finalDvs: 72 },
    { companyName: "BioTech Inc", industryKey: "SALUD", finalGci: 62.0, finalBrs: 1.9, finalDvs: 58 },
    { companyName: "Sanitas Group", industryKey: "SALUD", finalGci: 39.0, finalBrs: 3.1, finalDvs: 80 },
    { companyName: "MedLine Corp", industryKey: "SALUD", finalGci: 50.1, finalBrs: 2.5, finalDvs: 64 },
    // Tecnologia
    { companyName: "SaaS Rocket", industryKey: "TECNOLOGIA", finalGci: 18.5, finalBrs: 4.1, finalDvs: 95 },
    { companyName: "Cloud Systems", industryKey: "TECNOLOGIA", finalGci: 35.0, finalBrs: 3.3, finalDvs: 88 },
    { companyName: "CyberSecurity Pro", industryKey: "TECNOLOGIA", finalGci: 48.0, finalBrs: 2.6, finalDvs: 76 },
    { companyName: "DataFlow", industryKey: "TECNOLOGIA", finalGci: 55.4, finalBrs: 2.2, finalDvs: 68 },
    { companyName: "Enterprise AI", industryKey: "TECNOLOGIA", finalGci: 67.8, finalBrs: 1.6, finalDvs: 55 },
    // Oil & Gas
    { companyName: "Energia del Sol", industryKey: "OIL_GAS", finalGci: 25.0, finalBrs: 3.8, finalDvs: 88 },
    { companyName: "Oil Refining Co", industryKey: "OIL_GAS", finalGci: 42.0, finalBrs: 2.9, finalDvs: 74 },
    { companyName: "Gasoductos Global", industryKey: "OIL_GAS", finalGci: 60.5, finalBrs: 2.0, finalDvs: 61 },
    { companyName: "PetroAndina", industryKey: "OIL_GAS", finalGci: 33.0, finalBrs: 3.4, finalDvs: 82 },
    { companyName: "Apex Power", industryKey: "OIL_GAS", finalGci: 51.0, finalBrs: 2.5, finalDvs: 67 },
    // Global / General
    { companyName: "Global Corporation", industryKey: "GLOBAL", finalGci: 30.5, finalBrs: 3.5, finalDvs: 83 },
    { companyName: "Worldwide Enterprises", industryKey: "GLOBAL", finalGci: 46.0, finalBrs: 2.7, finalDvs: 76 },
    { companyName: "Apex Holding", industryKey: "GLOBAL", finalGci: 22.0, finalBrs: 3.9, finalDvs: 89 },
    { companyName: "Universal Industries", industryKey: "GLOBAL", finalGci: 59.0, finalBrs: 2.0, finalDvs: 62 },
    { companyName: "Transnational Group", industryKey: "GLOBAL", finalGci: 74.0, finalBrs: 1.3, finalDvs: 52 }
  ];

  for (const item of seedData) {
    await prisma.benchmark.create({
      data: item
    });
  }

  console.log(`Successfully seeded ${seedData.length} benchmark records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

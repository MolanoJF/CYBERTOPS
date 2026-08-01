import prisma from './src/lib/prisma.js';
import { getIndustryPercentile, saveSessionToBenchmark } from './src/lib/benchmark.js';

async function testDatabase() {
  console.log("=== RUNNING DATABASE & PRISMA TESTS ===");
  try {
    // 1. Check connection and fetch benchmarks count
    console.log("\nConnecting to SQLite database...");
    const benchmarksCount = await prisma.benchmark.count();
    console.log(`Database connected successfully. Found ${benchmarksCount} benchmark records.`);
    
    assert(benchmarksCount > 0, "Seed data should have been populated");

    // 2. Fetch all benchmarks for BANCA
    const bancaBenchmarks = await prisma.benchmark.findMany({
      where: { industryKey: 'BANCA' }
    });
    console.log(`Found ${bancaBenchmarks.length} seeded records for BANCA.`);
    assert(bancaBenchmarks.length > 0, "Should find seeded BANCA records");

    // Print some seeded values
    console.log("Sample BANCA peer scores:");
    bancaBenchmarks.slice(0, 3).forEach((b, idx) => {
      console.log(`  Peer ${idx + 1}: ${b.companyName} | GCI: ${b.finalGci} | BRS: ${b.finalBrs} | DVS: ${b.finalDvs}`);
    });

    // 3. Test percentile calculations
    console.log("\nCalculating percentiles for a mock session with GCI = 35 in BANCA...");
    // A lower GCI is better (e.g. 35 is better than peers with GCI > 35)
    const percentile = await getIndustryPercentile('BANCA', 35);
    console.log(`Calculated Percentile for GCI 35: ${percentile}%`);

    // Let's verify by sorting GCI values and calculating manually
    const gcis = bancaBenchmarks.map(b => b.finalGci).sort((a,b) => a - b);
    console.log("Sorted peer GCIs for BANCA:", gcis);
    const worsePeers = bancaBenchmarks.filter(b => b.finalGci > 35);
    const expectedPercentile = Math.round((worsePeers.length / bancaBenchmarks.length) * 100);
    console.log(`Manual Percentile Calculation: Worse peers count = ${worsePeers.length}/${bancaBenchmarks.length} -> Expected: ${expectedPercentile}%`);
    assert(percentile === expectedPercentile, "Percentile ranking calculation mismatch");
    console.log("✔ Percentile ranking logic verified successfully.");

    // 4. Test session saving
    console.log("\nSaving a mock session state to the benchmark table...");
    const mockSessionState = {
      companyName: 'Test Inc',
      industryKey: 'BANCA',
      gci: 40,
      brs: 3.0,
      dvs: 85
    };
    const saved = await saveSessionToBenchmark(mockSessionState);
    console.log(`Saved benchmark: ID=${saved.id}, Company=${saved.companyName}`);
    assert(saved.companyName === 'Test Inc', "Saved company name should match");
    
    // Clean up test entry
    await prisma.benchmark.delete({
      where: { id: saved.id }
    });
    console.log("Cleaned up test entry successfully.");

    console.log("\n✔ DATABASE AND PRISMA CLIENT VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("\nFAIL: Database test assertion failed:", err.stack || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

testDatabase();

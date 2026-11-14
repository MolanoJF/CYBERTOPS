import prisma from './prisma.js';

/**
 * Saves a completed session's metrics to the Benchmark database
 */
export async function saveSessionToBenchmark(sessionState) {
  try {
    const benchmark = await prisma.benchmark.create({
      data: {
        companyName: sessionState.companyName,
        industryKey: sessionState.industryKey,
        finalGci: sessionState.gci,
        finalBrs: sessionState.brs,
        finalDvs: sessionState.dvs,
        completedAt: new Date()
      }
    });
    return benchmark;
  } catch (error) {
    console.error("Error saving session to benchmark database:", error);
    return null;
  }
}

/**
 * Calculates the percentile ranking of a given GCI score compared to peers in the same industry.
 * A lower GCI is a better score (meaning higher readiness and lower crisis level).
 * E.g., if a GCI is 30, and 4 out of 5 peers had GCI > 30, the percentile is 80%.
 */
export async function getIndustryPercentile(industryKey, finalGci) {
  try {
    const benchmarks = await prisma.benchmark.findMany({
      where: {
        industryKey: industryKey
      }
    });

    if (benchmarks.length === 0) {
      return 50; // Return 50% if there is no benchmark data
    }

    // Peers with a higher GCI performed worse than the current session
    const worsePeers = benchmarks.filter(b => b.finalGci > finalGci);
    
    // Percentile is the proportion of peers that performed worse than us
    const percentile = Math.round((worsePeers.length / benchmarks.length) * 100);
    
    return Math.max(0, Math.min(100, percentile));
  } catch (error) {
    console.error("Error calculating industry percentile ranking:", error);
    return 50;
  }
}

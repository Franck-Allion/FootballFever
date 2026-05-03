import { runBatchSimulation } from './src/domains/match/logic/BatchSimulator.js';

const config = {
  matchCount: 1000,
  baseSeed: Date.now(),
  homeRating: { shooting: 50 },
  awayRating: { shooting: 50 }
};

console.log(`Running batch simulation: ${config.matchCount} matches...`);
const startTime = Date.now();
const result = runBatchSimulation(config);
const endTime = Date.now();

console.log('\n--- BATCH SIMULATION RESULTS ---');
console.log(`Duration: ${(endTime - startTime) / 1000}s`);
console.log(`Total Invariant Failures: ${result.invariantFailures.length}`);

if (result.invariantFailures.length > 0) {
  console.log('Sample Failures:', result.invariantFailures.slice(0, 5));
}

console.log('\n--- AGGREGATE METRICS ---');
console.table({
  'Matches': result.aggregates.totalMatches,
  'Home Win Rate': (result.aggregates.homeWinRate * 100).toFixed(1) + '%',
  'Draw Rate': (result.aggregates.drawRate * 100).toFixed(1) + '%',
  'Away Win Rate': (result.aggregates.awayWinRate * 100).toFixed(1) + '%',
  'Avg Goals / Match': result.aggregates.averageGoalsPerMatch.toFixed(2),
  'Avg Shots / Team': result.aggregates.averageShotsPerTeam.toFixed(2),
  'Avg SOT / Team': result.aggregates.averageShotsOnTargetPerTeam.toFixed(2),
  'Avg xG / Team': result.aggregates.averageXGPerTeam.toFixed(2),
  'Total Goals': result.aggregates.totalGoals
});

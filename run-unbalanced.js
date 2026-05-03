import { runBatchSimulation } from './src/domains/match/logic/BatchSimulator.js';

const config = {
  matchCount: 1000,
  baseSeed: 12345,
  homeRating: { shooting: 90, control: 90 }, // SUPER STRONG
  awayRating: { shooting: 10, control: 10 }  // VERY WEAK
};

console.log(`Running dynamic unbalanced simulation: Home (S:90, C:90) vs Away (S:10, C:10)...`);
const result = runBatchSimulation(config);

console.log('\n--- DYNAMIC UNBALANCED MATCH RESULTS ---');
console.table({
  'Home Win Rate': (result.aggregates.homeWinRate * 100).toFixed(1) + '%',
  'Draw Rate': (result.aggregates.drawRate * 100).toFixed(1) + '%',
  'Away Win Rate': (result.aggregates.awayWinRate * 100).toFixed(1) + '%',
  'Avg Home Goals': (result.aggregates.homeGoals / 1000).toFixed(2),
  'Avg Away Goals': (result.aggregates.awayGoals / 1000).toFixed(2),
  'Avg Shots Home': (result.aggregates.totalShots / 1000).toFixed(2), // This is shared in aggregates, need manual split
});

let homeShots = 0;
let awayShots = 0;
for(const m of result.matches) {
    homeShots += m.finalState.homeStats.shots;
    awayShots += m.finalState.awayStats.shots;
}

console.log(`Avg Shots per Team: Home ${(homeShots/1000).toFixed(2)} vs Away ${(awayShots/1000).toFixed(2)}`);

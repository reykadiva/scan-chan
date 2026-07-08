/**
 * Test Balanced Level 1-50 Formula
 */

// NEW balanced formula
function xpForNextLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Early game (1-10): Linear-ish growth
  if (level <= 10) {
    return level * 100 + 100;
  }
  
  // Mid game (11-30): Moderate growth
  if (level <= 30) {
    return level * 150 + 500;
  }
  
  // Late game (31-50): Slower growth
  return level * 200 + 2000;
}

function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpForNextLevel(l);
  }
  return total;
}

function getHappinessGains(level: number): { feed: number; pet: number; cap: number } {
  if (level <= 5) return { feed: 3, pet: 5, cap: 50 };
  if (level <= 10) return { feed: 2, pet: 3, cap: 75 };
  if (level <= 20) return { feed: 1.5, pet: 2, cap: 90 };
  if (level <= 35) return { feed: 1, pet: 1.5, cap: 95 };
  return { feed: 1, pet: 1, cap: 100 };
}

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║         BALANCED LEVEL 1-50 PROGRESSION (NEW FORMULA)            ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log('📊 KEY MILESTONES TABLE\n');
console.log('┌──────┬──────────────┬──────────────┬───────────┬──────────────────┐');
console.log('│ Lvl  │  XP for Next │  Total XP    │ Scans     │  Days (10/day)   │');
console.log('├──────┼──────────────┼──────────────┼───────────┼──────────────────┤');

[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(level => {
  const xpForNext = xpForNextLevel(level + 1);
  const totalXp = xpForLevel(level);
  const scans = Math.ceil(totalXp / 10);
  const days = Math.ceil(totalXp / 100);
  const gains = getHappinessGains(level);
  
  console.log(
    `│ ${level.toString().padStart(2, ' ')}   │ ${xpForNext.toString().padStart(12, ' ')} │ ${totalXp.toString().padStart(12, ' ')} │ ${scans.toString().padStart(9, ' ')} │ ${days.toString().padStart(6, ' ')} days     │`
  );
});

console.log('└──────┴──────────────┴──────────────┴───────────┴──────────────────┘\n');

console.log('\n🎯 COMPLETE LEVEL 1-50 TABLE\n');
console.log('┌──────┬────────────┬──────────────┬───────────┬──────────┬────────────┐');
console.log('│ Lvl  │ XP Needed  │  Total XP    │   Scans   │   Days   │  Happiness │');
console.log('├──────┼────────────┼──────────────┼───────────┼──────────┼────────────┤');

for (let level = 1; level <= 50; level++) {
  const xpForNext = xpForNextLevel(level + 1);
  const totalXp = xpForLevel(level);
  const scans = Math.ceil(totalXp / 10);
  const days = Math.ceil(totalXp / 100);
  const gains = getHappinessGains(level);
  
  console.log(
    `│ ${level.toString().padStart(2, ' ')}   │ ${xpForNext.toString().padStart(10, ' ')} │ ${totalXp.toString().padStart(12, ' ')} │ ${scans.toString().padStart(9, ' ')} │ ${days.toString().padStart(8, ' ')} │ F:${gains.feed} P:${gains.pet}  │`
  );
  
  if (level === 5) console.log('├──────┼────────────┼──────────────┼───────────┼──────────┼────────────┤ Tutorial Done');
  if (level === 10) console.log('├──────┼────────────┼──────────────┼───────────┼──────────┼────────────┤ Early Game');
  if (level === 20) console.log('├──────┼────────────┼──────────────┼───────────┼──────────┼────────────┤ Mid Game');
  if (level === 35) console.log('├──────┼────────────┼──────────────┼───────────┼──────────┼────────────┤ Late Game');
  if (level === 50) console.log('└──────┴────────────┴──────────────┴───────────┴──────────┴────────────┘ END GAME');
}

console.log('\n\n🎮 TIME TO REACH LEVEL 50\n');
const level50XP = xpForLevel(50);
const level50Scans = Math.ceil(level50XP / 10);
const level50Days = Math.ceil(level50XP / 100);
const level50Weeks = Math.ceil(level50Days / 7);
const level50Months = Math.ceil(level50Days / 30);

console.log(`Total XP:              ${level50XP.toLocaleString()} XP`);
console.log(`Total Scans:           ${level50Scans.toLocaleString()} scans`);
console.log(`Days (10 scans/day):   ${level50Days} days`);
console.log(`Weeks:                 ${level50Weeks} weeks`);
console.log(`Months:                ${level50Months} months\n`);

console.log('Player Types:');
console.log(`  Casual (5/day):      ${Math.ceil(level50Days * 2)} days (${Math.ceil(level50Days * 2 / 30)} months)`);
console.log(`  Regular (10/day):    ${level50Days} days (${level50Months} months)`);
console.log(`  Active (20/day):     ${Math.ceil(level50Days / 2)} days (${Math.ceil(level50Days / 2 / 30)} months)`);
console.log(`  Hardcore (50/day):   ${Math.ceil(level50Days / 5)} days (${Math.ceil(level50Days / 5 / 30)} months)`);
console.log(`  Super (100/day):     ${Math.ceil(level50Days / 10)} days (${Math.ceil(level50Days / 10 / 30)} months)\n`);

console.log('\n💖 HAPPINESS SYSTEM SUMMARY\n');
console.log('Level 1-5:   Feed +3, Pet +5  → Max 50 (YOUNG_CAT)');
console.log('Level 6-10:  Feed +2, Pet +3  → Max 75 (ADULT_CAT)');
console.log('Level 11-20: Feed +1.5, Pet +2 → Max 90 (WISE_CAT)');
console.log('Level 21-35: Feed +1, Pet +1.5 → Max 95 (LEGENDARY)');
console.log('Level 36-50: Feed +1, Pet +1  → Max 100 (PERFECT)\n');

console.log('\n🏆 EVOLUTION MILESTONES\n');
console.log('Level 5:  Unlock YOUNG_CAT');
console.log('Level 10: Unlock ADULT_CAT');
console.log('Level 20: Unlock WISE_CAT');
console.log('Level 35: Unlock LEGENDARY_CAT');
console.log('Level 50: Unlock Perfect 100 Affection\n');

console.log('═══════════════════════════════════════════════════════════════════\n');

export {};

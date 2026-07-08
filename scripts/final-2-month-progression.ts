/**
 * Final 2-Month Level 50 Progression
 * Target: 20-30 scans per day
 */

// FINAL balanced formula
function xpForNextLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Early game (1-10): Fast progression for tutorial
  if (level <= 10) {
    return level * 30 + 70; // ~100-370 XP per level
  }
  
  // Mid game (11-30): Moderate growth
  if (level <= 30) {
    return level * 50 + 150; // ~700-1,650 XP per level
  }
  
  // Late game (31-50): Steady growth
  return level * 70 + 400; // ~2,570-3,900 XP per level
}

function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpForNextLevel(l);
  }
  return total;
}

function getHappinessGains(level: number): { feed: number; pet: number; cap: number; tier: string } {
  if (level <= 5) return { feed: 3, pet: 5, cap: 50, tier: 'Tutorial' };
  if (level <= 10) return { feed: 2, pet: 3, cap: 75, tier: 'Early' };
  if (level <= 20) return { feed: 1.5, pet: 2, cap: 90, tier: 'Mid' };
  if (level <= 35) return { feed: 1, pet: 1.5, cap: 95, tier: 'Late' };
  return { feed: 1, pet: 1, cap: 100, tier: 'End' };
}

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║    FINAL LEVEL 1-50 PROGRESSION (2 MONTHS TARGET)                ║');
console.log('║    Target: 20-30 scans/day, 60 days to level 50                  ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log('📊 COMPLETE LEVEL TABLE (1-50)\n');
console.log('┌──────┬────────┬────────────┬──────────────┬────────┬──────────┬─────────┐');
console.log('│ Lvl  │ Tier   │ XP Needed  │  Total XP    │ Scans  │ Days 20/d│ Happiness│');
console.log('├──────┼────────┼────────────┼──────────────┼────────┼──────────┼─────────┤');

for (let level = 1; level <= 50; level++) {
  const xpForNext = xpForNextLevel(level + 1);
  const totalXp = xpForLevel(level);
  const scans = Math.ceil(totalXp / 10);
  const days20 = Math.ceil(totalXp / 200); // 20 scans * 10 XP
  const gains = getHappinessGains(level);
  
  console.log(
    `│ ${level.toString().padStart(2, ' ')}   │ ${gains.tier.padEnd(6, ' ')} │ ${xpForNext.toString().padStart(10, ' ')} │ ${totalXp.toString().padStart(12, ' ')} │ ${scans.toString().padStart(6, ' ')} │ ${days20.toString().padStart(8, ' ')} │ F:${gains.feed} P:${gains.pet} │`
  );
  
  if (level === 5 || level === 10 || level === 20 || level === 35) {
    console.log('├──────┼────────┼────────────┼──────────────┼────────┼──────────┼─────────┤');
  }
}

console.log('└──────┴────────┴────────────┴──────────────┴────────┴──────────┴─────────┘\n');

console.log('\n🎯 KEY MILESTONES\n');
[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(level => {
  const totalXp = xpForLevel(level);
  const scans = Math.ceil(totalXp / 10);
  const days20 = Math.ceil(totalXp / 200);
  const days30 = Math.ceil(totalXp / 300);
  const gains = getHappinessGains(level);
  
  console.log(
    `Level ${level.toString().padStart(2, ' ')}: ${totalXp.toLocaleString().padStart(8, ' ')} XP | ${scans.toLocaleString().padStart(5, ' ')} scans | ${days20.toString().padStart(2, ' ')} days (20/d) | ${days30.toString().padStart(2, ' ')} days (30/d) | Cap ${gains.cap}`
  );
});

console.log('\n\n🎮 TIME TO REACH LEVEL 50\n');
const level50XP = xpForLevel(50);
const level50Scans = Math.ceil(level50XP / 10);

console.log(`Total XP Required:     ${level50XP.toLocaleString()} XP`);
console.log(`Total Scans Needed:    ${level50Scans.toLocaleString()} scans\n`);

console.log('Player Activity Levels:');
console.log(`  Casual (10 scans/day):    ${Math.ceil(level50XP / 100)} days (${Math.ceil(level50XP / 100 / 30)} months)`);
console.log(`  Regular (20 scans/day):   ${Math.ceil(level50XP / 200)} days (${Math.ceil(level50XP / 200 / 30).toFixed(1)} months) ⭐ TARGET`);
console.log(`  Active (30 scans/day):    ${Math.ceil(level50XP / 300)} days (${Math.ceil(level50XP / 300 / 30).toFixed(1)} months) ⭐ TARGET`);
console.log(`  Hardcore (50 scans/day):  ${Math.ceil(level50XP / 500)} days (${Math.ceil(level50XP / 500 / 30).toFixed(1)} months)`);
console.log(`  Super (100 scans/day):    ${Math.ceil(level50XP / 1000)} days (${Math.ceil(level50XP / 1000 / 30).toFixed(1)} months)\n`);

console.log('\n💖 HAPPINESS SYSTEM (LEVEL-BASED)\n');
console.log('┌──────────────┬──────────┬──────────┬──────────┬─────────────────────┐');
console.log('│ Level Range  │ Feed (+) │ Pet (+)  │ Max Cap  │ Max Evolution Stage │');
console.log('├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤');
console.log('│ 1-5          │    3     │    5     │    50    │ YOUNG_CAT           │');
console.log('│ 6-10         │    2     │    3     │    75    │ ADULT_CAT           │');
console.log('│ 11-20        │    1.5   │    2     │    90    │ WISE_CAT            │');
console.log('│ 21-35        │    1     │    1.5   │    95    │ LEGENDARY_CAT       │');
console.log('│ 36-50        │    1     │    1     │   100    │ LEGENDARY (Perfect) │');
console.log('└──────────────┴──────────┴──────────┴──────────┴─────────────────────┘\n');

console.log('\n🐱 PET EVOLUTION PROGRESSION\n');
console.log('Level 1:  🐱 KITTEN (start at 10 affection)');
console.log('Level 5:  🐈 YOUNG_CAT unlockable (cap 50)');
console.log('Level 10: 🐈‍⬛ ADULT_CAT unlockable (cap 75)');
console.log('Level 20: 🐈 WISE_CAT unlockable (cap 90)');
console.log('Level 35: 👑 LEGENDARY_CAT unlockable (cap 95)');
console.log('Level 50: ⭐ Perfect LEGENDARY (cap 100 - MAX)\n');

console.log('\n⏱️ TIME TO EVOLVE (from level start)\n');
const evolutions = [
  { stage: 'KITTEN → YOUNG_CAT', level: '1-5', gain: 40, feedGain: 3, petGain: 5 },
  { stage: 'YOUNG_CAT → ADULT_CAT', level: '6-10', gain: 25, feedGain: 2, petGain: 3 },
  { stage: 'ADULT_CAT → WISE_CAT', level: '11-20', gain: 15, feedGain: 1.5, petGain: 2 },
  { stage: 'WISE_CAT → LEGENDARY', level: '21-35', gain: 5, feedGain: 1, petGain: 1.5 },
  { stage: 'LEGENDARY → Perfect', level: '36-50', gain: 5, feedGain: 1, petGain: 1 },
];

evolutions.forEach(evo => {
  const feeds = Math.ceil(evo.gain / evo.feedGain);
  const pets = Math.ceil(evo.gain / evo.petGain);
  const minutes = Math.ceil((pets * 3) / 60);
  
  console.log(`${evo.stage.padEnd(26, ' ')} (Lv ${evo.level}): ${feeds} feeds or ${pets} pets (~${minutes} min)`);
});

console.log('\n\n📈 GAMEPLAY BALANCE SUMMARY\n');
console.log('✅ Level 1-10 (Tutorial/Early):');
console.log('   • ~5-10 days to complete');
console.log('   • Fast XP gain, easy happiness');
console.log('   • Unlock YOUNG_CAT and ADULT_CAT\n');

console.log('✅ Level 11-25 (Mid Game):');
console.log('   • ~20-30 days to complete');
console.log('   • Moderate XP gain, happiness slows down');
console.log('   • Working towards WISE_CAT\n');

console.log('✅ Level 26-40 (Late Game):');
console.log('   • ~25-35 days to complete');
console.log('   • Slower XP gain, happiness requires dedication');
console.log('   • Unlock LEGENDARY_CAT\n');

console.log('✅ Level 41-50 (End Game):');
console.log('   • ~10-15 days to complete');
console.log('   • Hardest tier, minimal happiness gain');
console.log('   • Achieve Perfect 100 Affection\n');

console.log('═══════════════════════════════════════════════════════════════════\n');

export {};

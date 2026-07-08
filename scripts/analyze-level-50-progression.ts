/**
 * Level 1-50 Progression Analysis
 * With Level-Based Happiness System
 */

// Level formula from game-config.ts
function xpForNextLevel(level: number): number {
  return (level - 1) * (level - 1) * 100 + 200;
}

function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpForNextLevel(l);
  }
  return total;
}

type PetStage = 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT';

function getPetStage(affection: number): PetStage {
  if (affection < 25) return 'KITTEN';
  else if (affection < 50) return 'YOUNG_CAT';
  else if (affection < 75) return 'ADULT_CAT';
  else if (affection < 95) return 'WISE_CAT';
  else return 'LEGENDARY_CAT';
}

// Proposed happiness gain system (level-based)
function getHappinessGains(level: number): { feed: number; pet: number; cap: number; tier: string } {
  if (level <= 5) return { feed: 3, pet: 5, cap: 50, tier: 'Tutorial' };
  if (level <= 10) return { feed: 2, pet: 3, cap: 75, tier: 'Early Game' };
  if (level <= 20) return { feed: 1.5, pet: 2, cap: 90, tier: 'Mid Game' };
  if (level <= 35) return { feed: 1, pet: 1.5, cap: 95, tier: 'Late Game' };
  return { feed: 1, pet: 1, cap: 100, tier: 'End Game' };
}

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║      SCAN CHAN - LEVEL 1-50 PROGRESSION ANALYSIS                 ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log('📊 COMPLETE LEVEL TABLE (1-50)\n');
console.log('┌──────┬───────────┬──────────────┬──────────────┬────────────────────┐');
console.log('│ Lvl  │   Tier    │  XP Needed   │  Total XP    │  Days (10 scans/d) │');
console.log('├──────┼───────────┼──────────────┼──────────────┼────────────────────┤');

const milestones = [
  { level: 5, label: '🎓 Tutorial Complete' },
  { level: 10, label: '⚔️ Early Game' },
  { level: 20, label: '🏆 Mid Game' },
  { level: 35, label: '🌟 Late Game' },
  { level: 50, label: '👑 END GAME MASTER' },
];

for (let level = 1; level <= 50; level++) {
  const xpForNext = xpForNextLevel(level + 1);
  const totalXp = xpForLevel(level);
  const days = Math.ceil(totalXp / 100); // 10 scans/day * 10 XP = 100 XP/day
  const gains = getHappinessGains(level);
  
  console.log(
    `│ ${level.toString().padStart(2, ' ')}   │ ${gains.tier.padEnd(9, ' ')} │ ${xpForNext.toString().padStart(12, ' ')} │ ${totalXp.toString().padStart(12, ' ')} │ ${days.toString().padStart(7, ' ')} days      │`
  );
  
  // Show milestone markers
  const milestone = milestones.find(m => m.level === level);
  if (milestone) {
    console.log('├──────┼───────────┼──────────────┼──────────────┼────────────────────┤');
    console.log(`│      │ ${milestone.label.padEnd(62, ' ')}│`);
    console.log('├──────┼───────────┼──────────────┼──────────────┼────────────────────┤');
  }
}

console.log('└──────┴───────────┴──────────────┴──────────────┴────────────────────┘\n');

console.log('\n🎯 KEY MILESTONES\n');
[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(level => {
  const totalXp = xpForLevel(level);
  const scans = Math.ceil(totalXp / 10);
  const days = Math.ceil(totalXp / 100);
  const gains = getHappinessGains(level);
  
  console.log(`Level ${level.toString().padStart(2, ' ')}: ${totalXp.toLocaleString().padStart(10, ' ')} XP | ${scans.toLocaleString().padStart(7, ' ')} scans | ${days.toString().padStart(4, ' ')} days | F:+${gains.feed} P:+${gains.pet} (cap ${gains.cap})`);
});

console.log('\n\n💖 LEVEL-BASED HAPPINESS SYSTEM\n');
console.log('┌──────────────┬──────────┬──────────┬──────────┬─────────────────────┐');
console.log('│ Level Range  │ Feed (+) │ Pet (+)  │ Max Cap  │ Max Evolution Stage │');
console.log('├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤');
console.log('│ 1-5          │    3     │    5     │    50    │ YOUNG_CAT           │');
console.log('│ 6-10         │    2     │    3     │    75    │ ADULT_CAT           │');
console.log('│ 11-20        │    1.5   │    2     │    90    │ WISE_CAT            │');
console.log('│ 21-35        │    1     │    1.5   │    95    │ LEGENDARY_CAT       │');
console.log('│ 36-50        │    1     │    1     │   100    │ LEGENDARY_CAT (Max) │');
console.log('└──────────────┴──────────┴──────────┴──────────┴─────────────────────┘\n');

console.log('\n🐱 PET EVOLUTION UNLOCKS BY LEVEL\n');
console.log('Level 1:  🐱 KITTEN available (start)');
console.log('Level 5:  🐈 YOUNG_CAT unlockable (affection cap 50)');
console.log('Level 10: 🐈‍⬛ ADULT_CAT unlockable (affection cap 75)');
console.log('Level 20: 🐈 WISE_CAT unlockable (affection cap 90)');
console.log('Level 35: 👑 LEGENDARY_CAT unlockable (affection cap 95)');
console.log('Level 50: ⭐ Perfect LEGENDARY (affection cap 100)\n');

console.log('\n⏱️ TIME TO REACH EACH EVOLUTION (from level start)\n');

const evolutionTime = [
  { stage: 'KITTEN → YOUNG_CAT', level: '1-5', affection: 40, feedGain: 3, petGain: 5 },
  { stage: 'YOUNG_CAT → ADULT_CAT', level: '6-10', affection: 25, feedGain: 2, petGain: 3 },
  { stage: 'ADULT_CAT → WISE_CAT', level: '11-20', affection: 15, feedGain: 1.5, petGain: 2 },
  { stage: 'WISE_CAT → LEGENDARY', level: '21-35', affection: 5, feedGain: 1, petGain: 1.5 },
  { stage: 'LEGENDARY → Perfect', level: '36-50', affection: 5, feedGain: 1, petGain: 1 },
];

console.log('┌───────────────────────────┬──────────┬──────────┬──────────────┐');
console.log('│ Evolution Stage           │ Level    │ Feeds    │ Time (pets)  │');
console.log('├───────────────────────────┼──────────┼──────────┼──────────────┤');

evolutionTime.forEach(evo => {
  const feedsNeeded = Math.ceil(evo.affection / evo.feedGain);
  const petsNeeded = Math.ceil(evo.affection / evo.petGain);
  const timeSeconds = petsNeeded * 3;
  const timeMinutes = Math.ceil(timeSeconds / 60);
  
  console.log(
    `│ ${evo.stage.padEnd(25, ' ')} │ ${evo.level.padEnd(8, ' ')} │ ${feedsNeeded.toString().padStart(3, ' ')}      │ ${timeMinutes.toString().padStart(3, ' ')} minutes  │`
  );
});

console.log('└───────────────────────────┴──────────┴──────────┴──────────────┘\n');

console.log('\n📈 GAMEPLAY PROGRESSION BALANCE\n');
console.log('Early Game (Lv 1-10):');
console.log('  • Fast progression, easy happiness gain');
console.log('  • Players learn mechanics, feel rewarded quickly');
console.log('  • ~1-2 weeks of daily play to reach level 10\n');

console.log('Mid Game (Lv 11-25):');
console.log('  • Moderate difficulty, happiness gain slows down');
console.log('  • Players need consistent play to maintain progress');
console.log('  • ~1-2 months of daily play (10-20 scans/day)\n');

console.log('Late Game (Lv 26-40):');
console.log('  • Challenging, requires dedication');
console.log('  • Happiness gain significantly reduced');
console.log('  • ~3-4 months of consistent play\n');

console.log('End Game (Lv 41-50):');
console.log('  • Expert tier, hardcore players only');
console.log('  • Minimal happiness gain (1 per action)');
console.log('  • ~6+ months of dedicated play for level 50\n');

console.log('\n🎮 ESTIMATED PLAY TIME TO REACH LEVEL 50\n');
const level50XP = xpForLevel(50);
const level50Scans = Math.ceil(level50XP / 10);
const level50Days = Math.ceil(level50XP / 100);
const level50Weeks = Math.ceil(level50Days / 7);
const level50Months = Math.ceil(level50Days / 30);

console.log(`Total XP Required:  ${level50XP.toLocaleString()} XP`);
console.log(`Total Scans:        ${level50Scans.toLocaleString()} scans`);
console.log(`Days (10 scans/d):  ${level50Days} days`);
console.log(`Weeks:              ${level50Weeks} weeks`);
console.log(`Months:             ${level50Months} months\n`);

console.log('Casual Player (5 scans/day):   ~' + Math.ceil(level50Days * 2) + ' days (' + Math.ceil(level50Days * 2 / 30) + ' months)');
console.log('Regular Player (10 scans/day): ~' + level50Days + ' days (' + level50Months + ' months)');
console.log('Active Player (20 scans/day):  ~' + Math.ceil(level50Days / 2) + ' days (' + Math.ceil(level50Days / 2 / 30) + ' months)');
console.log('Hardcore (50 scans/day):       ~' + Math.ceil(level50Days / 5) + ' days (' + Math.ceil(level50Days / 5 / 30) + ' months)\n');

console.log('\n✅ IMPLEMENTATION CHECKLIST\n');
console.log('[ ] 1. Update feedPet() function to check player level');
console.log('[ ] 2. Add getHappinessGains(level) helper function');
console.log('[ ] 4. Implement affection cap based on level');
console.log('[ ] 5. Add UI indicator for "Unlock at Level X"');
console.log('[ ] 6. Update pet evolution logic to respect caps');
console.log('[ ] 7. Add toast message when hitting affection cap');
console.log('[ ] 8. Optional: Add achievements for each evolution unlock');
console.log('[ ] 9. Test with different level ranges');
console.log('[ ] 10. Update documentation\n');

console.log('\n💡 ADDITIONAL FEATURES TO CONSIDER\n');
console.log('1. Daily Happiness Bonus (first 10 pets/feeds get 1.5x)');
console.log('2. Favorite Food System (certain categories = bonus happiness)');
console.log('3. Mood System (pet mood affects happiness multiplier)');
console.log('4. Streak Bonus (7-day streak = +1 to all happiness gains)');
console.log('5. Event Days (weekends = 2x happiness gain)');
console.log('6. Achievement Unlocks (reach LEGENDARY = permanent +0.5 bonus)\n');

console.log('═══════════════════════════════════════════════════════════════════\n');

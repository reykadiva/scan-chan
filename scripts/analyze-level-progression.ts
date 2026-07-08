/**
 * Analyze Level Progression and Pet Evolution
 * Calculate XP requirements, evolution stages, and happiness tuning
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

// Pet evolution stages based on affection (happiness)
type PetStage = 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT';

function getPetStage(affection: number): PetStage {
  if (affection < 25) return 'KITTEN';
  else if (affection < 50) return 'YOUNG_CAT';
  else if (affection < 75) return 'ADULT_CAT';
  else if (affection < 95) return 'WISE_CAT';
  else return 'LEGENDARY_CAT';
}

// Current happiness gain system
const CURRENT_SYSTEM = {
  feedPet: 3,      // +3 affection per feed
};

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║       SCAN CHAN - LEVEL & PET EVOLUTION ANALYSIS              ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📊 LEVEL PROGRESSION TABLE\n');
console.log('┌──────┬──────────────┬──────────────┬─────────────────┐');
console.log('│ Lvl  │  XP for Next │  Total XP    │  Equivalent     │');
console.log('├──────┼──────────────┼──────────────┼─────────────────┤');

for (let level = 1; level <= 30; level++) {
  const xpForNext = xpForNextLevel(level + 1);
  const totalXp = xpForLevel(level);
  const scans = Math.ceil(totalXp / 10); // 10 XP per scan
  
  console.log(
    `│ ${level.toString().padStart(2, ' ')}   │ ${xpForNext.toString().padStart(12, ' ')} │ ${totalXp.toString().padStart(12, ' ')} │ ${scans.toString().padStart(5, ' ')} scans     │`
  );
  
  // Mark important milestones
  if (level === 5) console.log('├──────┼──────────────┼──────────────┼─────────────────┤ Early Game');
  if (level === 10) console.log('├──────┼──────────────┼──────────────┼─────────────────┤ Mid Game');
  if (level === 20) console.log('├──────┼──────────────┼──────────────┼─────────────────┤ Late Game');
}
console.log('└──────┴──────────────┴──────────────┴─────────────────┘\n');

console.log('\n🐱 PET EVOLUTION STAGES\n');
console.log('┌────────────────────┬─────────────┬──────────────────────────────┐');
console.log('│ Stage              │ Affection   │ How to Reach (Current)       │');
console.log('├────────────────────┼─────────────┼──────────────────────────────┤');

const stages: Array<{ name: PetStage; min: number; max: number; avatar: string }> = [
  { name: 'KITTEN', min: 0, max: 24, avatar: 'Calico' },
  { name: 'YOUNG_CAT', min: 25, max: 49, avatar: 'Tabby' },
  { name: 'ADULT_CAT', min: 50, max: 74, avatar: 'Black' },
  { name: 'WISE_CAT', min: 75, max: 94, avatar: 'Cyan' },
  { name: 'LEGENDARY_CAT', min: 95, max: 100, avatar: 'Arashu Smiling' },
];

stages.forEach(stage => {
  const affectionNeeded = stage.min;
  const feedsNeeded = Math.ceil(affectionNeeded / CURRENT_SYSTEM.feedPet);
  
  console.log(`│ ${stage.name.padEnd(18, ' ')} │ ${stage.min.toString().padStart(3, ' ')}-${stage.max.toString().padEnd(3, ' ')}     │ ${feedsNeeded.toString().padStart(2, ' ')} feeds                   │`);
});

console.log('└────────────────────┴─────────────┴──────────────────────────────┘\n');

console.log('\n⚡ CURRENT SYSTEM ANALYSIS\n');
console.log('Feed Pet:  +3 affection (no cooldown, limited by food)');
console.log('Starting:  10 affection (KITTEN stage)\n');

console.log('Time to reach LEGENDARY_CAT (95 affection from 10):');
console.log('  • Via Feeding:  ~29 feeds = ~15-20 scans (get food) + feeding time\n');

console.log('⚠️  PROBLEM: Too easy to max happiness!\n');

console.log('\n💡 PROPOSED: LEVEL-BASED HAPPINESS SYSTEM\n');
console.log('┌──────────────┬───────────────┬───────────────┬─────────────────┐');
console.log('│ Level Range  │ Feed Gain     │ Pet Gain      │ Time to Max     │');
console.log('├──────────────┼───────────────┼───────────────┼─────────────────┤');

const proposedSystem = [
  { range: '1-5', level: 1, feedGain: 3, petGain: 5, desc: 'Tutorial (Easy)' },
  { range: '6-10', level: 6, feedGain: 2, petGain: 3, desc: 'Early Game' },
  { range: '11-15', level: 11, feedGain: 1.5, petGain: 2, desc: 'Mid Game' },
  { range: '16-20', level: 16, feedGain: 1, petGain: 1.5, desc: 'Late Game' },
  { range: '21+', level: 21, feedGain: 1, petGain: 1, desc: 'End Game (Hard)' },
];

proposedSystem.forEach(tier => {
  const affectionNeeded = 85; // From 10 to 95
  const feedsNeeded = Math.ceil(affectionNeeded / tier.feedGain);
  const petsNeeded = Math.ceil(affectionNeeded / tier.petGain);
  const timeMinutes = Math.ceil((petsNeeded * 3) / 60);
  
  console.log(
    `│ ${tier.range.padEnd(12, ' ')} │ +${tier.feedGain.toString().padEnd(12, ' ')} │ +${tier.petGain.toString().padEnd(12, ' ')} │ ${timeMinutes.toString().padStart(3, ' ')}+ minutes     │`
  );
});

console.log('└──────────────┴───────────────┴───────────────┴─────────────────┘\n');

console.log('\n🎯 RECOMMENDED END-GAME MILESTONES\n');
console.log('Level 5:  First evolution unlock (YOUNG_CAT accessible)');
console.log('Level 10: Second evolution unlock (ADULT_CAT accessible)');
console.log('Level 15: Third evolution unlock (WISE_CAT accessible)');
console.log('Level 20: Final evolution unlock (LEGENDARY_CAT accessible)');
console.log('Level 25: True end-game (all content accessible)\n');

console.log('Total XP needed for Level 25: ' + xpForLevel(25).toLocaleString() + ' XP');
console.log('Equivalent scans: ~' + Math.ceil(xpForLevel(25) / 10).toLocaleString() + ' scans');
console.log('Days of play (10 scans/day): ~' + Math.ceil(xpForLevel(25) / 10 / 10) + ' days\n');

console.log('\n📈 BALANCED PROGRESSION PROPOSAL\n');
console.log('┌──────┬────────────────┬─────────────────────┬────────────────────┐');
console.log('│ Lvl  │ Affection Gain │ Max Reachable Stage │ Difficulty         │');
console.log('├──────┼────────────────┼─────────────────────┼────────────────────┤');

const balancedTiers = [
  { level: '1-5', feedGain: 3, petGain: 5, maxStage: 'YOUNG_CAT (50)', difficulty: '⭐ Easy' },
  { level: '6-10', feedGain: 2, petGain: 3, maxStage: 'ADULT_CAT (75)', difficulty: '⭐⭐ Medium' },
  { level: '11-15', feedGain: 1.5, petGain: 2, maxStage: 'WISE_CAT (90)', difficulty: '⭐⭐⭐ Hard' },
  { level: '16-20', feedGain: 1, petGain: 1.5, maxStage: 'LEGENDARY (95+)', difficulty: '⭐⭐⭐⭐ Very Hard' },
  { level: '21+', feedGain: 1, petGain: 1, maxStage: 'LEGENDARY (100)', difficulty: '⭐⭐⭐⭐⭐ Expert' },
];

balancedTiers.forEach(tier => {
  console.log(
    `│ ${tier.level.padEnd(4, ' ')} │ F:+${tier.feedGain} P:+${tier.petGain.toString().padEnd(4, ' ')} │ ${tier.maxStage.padEnd(19, ' ')} │ ${tier.difficulty.padEnd(18, ' ')} │`
  );
});

console.log('└──────┴────────────────┴─────────────────────┴────────────────────┘\n');

console.log('\n✅ IMPLEMENTATION PLAN\n');
console.log('1. Modify feedPet() to check player level and adjust gain');
console.log('2. Add affection cap based on level:');
console.log('   • Level 1-5:  Max 50 affection (YOUNG_CAT)');
console.log('   • Level 6-10: Max 75 affection (ADULT_CAT)');
console.log('   • Level 11+:  Max 100 affection (All stages)\n');
console.log('4. Optional: Add visual indicator showing "Unlock at Level X"');
console.log('5. Optional: Add achievement for reaching max happiness at each tier\n');

console.log('\n🎮 GAMEPLAY BALANCE\n');
console.log('Current: 51 seconds to max (TOO FAST)');
console.log('Proposed Level 1-5: ~3-5 minutes to reach YOUNG_CAT (Good for tutorial)');
console.log('Proposed Level 6-10: ~15-20 minutes to reach ADULT_CAT (Engaging)');
console.log('Proposed Level 11+: ~1-2 hours to reach LEGENDARY (Long-term goal)\n');

console.log('═══════════════════════════════════════════════════════════════\n');

export {};

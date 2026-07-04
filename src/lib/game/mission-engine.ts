import type { MissionDefinition } from '@/types/content';
import type { MissionState, MissionGenerationInput, MissionProgressInput } from '@/types/mission';

const DAY_MS = 86400000;
const WEEK_MS = DAY_MS * 7;

function getStartOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getStartOfWeek(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

function selectRandomMissions(pool: readonly MissionDefinition[], count: number): readonly MissionDefinition[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateMissions(
  dailyPool: readonly MissionDefinition[],
  weeklyPool: readonly MissionDefinition[],
  input: MissionGenerationInput
): readonly MissionState[] {
  const startOfDay = getStartOfDay(input.now);
  const startOfWeek = getStartOfWeek(input.now);
  
  const activeDailies = input.existingMissions.filter(m => m.type === 'daily' && m.startedAt >= startOfDay);
  const activeWeeklies = input.existingMissions.filter(m => m.type === 'weekly' && m.startedAt >= startOfWeek);
  
  const needDailies = Math.max(0, input.dailyCount - activeDailies.length);
  const needWeeklies = Math.max(0, input.weeklyCount - activeWeeklies.length);
  
  const newDailies = selectRandomMissions(dailyPool, needDailies).map(def => ({
    id: `${def.id}-${startOfDay}`,
    type: 'daily' as const,
    name: def.name,
    description: def.description,
    objective: def.objective,
    target: def.target,
    progress: 0,
    rewardXp: def.rewardXp,
    completed: false,
    startedAt: startOfDay,
    expiresAt: startOfDay + DAY_MS,
  }));
  
  const newWeeklies = selectRandomMissions(weeklyPool, needWeeklies).map(def => ({
    id: `${def.id}-${startOfWeek}`,
    type: 'weekly' as const,
    name: def.name,
    description: def.description,
    objective: def.objective,
    target: def.target,
    progress: 0,
    rewardXp: def.rewardXp,
    completed: false,
    startedAt: startOfWeek,
    expiresAt: startOfWeek + WEEK_MS,
  }));
  
  return [...activeDailies, ...activeWeeklies, ...newDailies, ...newWeeklies];
}

export function updateMissionProgress(
  mission: MissionState,
  input: MissionProgressInput
): MissionState {
  if (mission.completed) return mission;
  
  let progress = mission.progress;
  
  if (mission.objective === 'scan_any') {
    progress = input.scanCount;
  } else if (mission.objective === 'register_any') {
    progress = input.registerCount;
  } else if (mission.objective === 'scan_category') {
    progress = input.scannedCategories.length;
  } else if (mission.objective === 'time_based') {
    progress = input.visitedToday ? progress + 1 : progress;
  }
  
  const completed = progress >= mission.target;
  return { ...mission, progress, completed };
}

export function updateAllMissions(
  missions: readonly MissionState[],
  input: MissionProgressInput
): readonly MissionState[] {
  return missions.map(m => updateMissionProgress(m, input));
}

export function pruneExpiredMissions(missions: readonly MissionState[], now: number): readonly MissionState[] {
  return missions.filter(m => m.expiresAt > now);
}

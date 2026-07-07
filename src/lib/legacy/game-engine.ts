import type { MissionProgress } from '@/types';

// Mission Template definition
interface MissionPayload {
  category?: string;
  [key: string]: unknown;
}

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  target: number;
  xpReward: number;
  evaluator: (actionType: string, payload: MissionPayload) => boolean;
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'scan_any',
    title: 'Daily Scanner',
    description: 'Scan 5 barcodes of any product',
    target: 5,
    xpReward: 50,
    evaluator: (actionType) => actionType === 'scan',
  },
  {
    id: 'register_any',
    title: 'New Discoveries',
    description: 'Register 3 new products to the database',
    target: 3,
    xpReward: 100,
    evaluator: (actionType) => actionType === 'register',
  },
  {
    id: 'scan_drink',
    title: 'Stay Hydrated',
    description: 'Scan a product in the Drink or Dairy category',
    target: 1,
    xpReward: 40,
    evaluator: (actionType, payload) =>
      actionType === 'scan' &&
      (payload.category?.toLowerCase() === 'drink' || payload.category?.toLowerCase() === 'dairy'),
  },
  {
    id: 'scan_snack',
    title: 'Snack Break',
    description: 'Scan a product in the Snack, Candy, or Biscuit category',
    target: 1,
    xpReward: 40,
    evaluator: (actionType, payload) =>
      actionType === 'scan' &&
      ['snack', 'candy', 'biscuit'].includes(payload.category?.toLowerCase() || ''),
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Scan any product between 5:00 AM and 9:00 AM',
    target: 1,
    xpReward: 30,
    evaluator: (actionType) => {
      if (actionType !== 'scan') return false;
      const hour = new Date().getHours();
      return hour >= 5 && hour < 9;
    },
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Scan any product between 8:00 PM and 11:59 PM',
    target: 1,
    xpReward: 30,
    evaluator: (actionType) => {
      if (actionType !== 'scan') return false;
      const hour = new Date().getHours();
      return hour >= 20 && hour < 24;
    },
  },
];

/**
 * Generate a consistent set of 4 daily missions based on a date seed string.
 * This guarantees the player gets the exact same missions on a given calendar day.
 */
export function generateDailyMissions(dateStr: string): MissionProgress[] {
  // Hash the dateStr to get a deterministic index selector
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const selectedTemplates: MissionTemplate[] = [];
  const templatesCopy = [...MISSION_TEMPLATES];

  // Deterministically select 4 unique templates
  for (let k = 0; k < 4; k++) {
    const idx = Math.abs((hash + k) * 31) % templatesCopy.length;
    selectedTemplates.push(templatesCopy[idx]);
    templatesCopy.splice(idx, 1);
  }

  return selectedTemplates.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    target: t.target,
    current: 0,
    xpReward: t.xpReward,
    completed: false,
  }));
}

/**
 * Evaluates active daily missions against a new game action.
 * Returns the updated missions list and the cumulative XP awarded for newly completed missions.
 */
export function evaluateMissions(
  missions: MissionProgress[],
  actionType: string,
  payload: MissionPayload
): { updatedMissions: MissionProgress[]; xpEarned: number } {
  let xpEarned = 0;

  const updatedMissions = missions.map((mission) => {
    if (mission.completed) return mission;

    const template = MISSION_TEMPLATES.find((t) => t.id === mission.id);
    if (!template) return mission;

    const isMatch = template.evaluator(actionType, payload);
    if (!isMatch) return mission;

    const nextCurrent = Math.min(mission.target, mission.current + 1);
    const newlyCompleted = nextCurrent === mission.target;

    if (newlyCompleted) {
      xpEarned += mission.xpReward;
    }

    return {
      ...mission,
      current: nextCurrent,
      completed: newlyCompleted,
    };
  });

  return { updatedMissions, xpEarned };
}



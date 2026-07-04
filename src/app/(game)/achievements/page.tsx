'use client';

import { BASE_ACHIEVEMENTS } from '@/lib/game';
import { useGameStore } from '@/stores/game-store';

export default function AchievementsPage() {
  const achievementProgress = useGameStore(state => state.achievementProgress);
  const unlockedAchievements = useGameStore(state => state.unlockedAchievements);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Achievements</h1>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {BASE_ACHIEVEMENTS.map(achievement => {
          const progress = achievementProgress[achievement.key];
          const isUnlocked = unlockedAchievements.includes(achievement.key);
          
          return (
            <div
              key={achievement.key}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                opacity: isUnlocked ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{achievement.emoji}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{achievement.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>{achievement.description}</p>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#888' }}>
                Progress: {progress?.progress ?? 0} / {achievement.threshold}
                {isUnlocked && ' ✓ Unlocked'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

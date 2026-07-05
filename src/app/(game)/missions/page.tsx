'use client';

import { useGameStore } from '@/stores/game-store';

// ponytail: simple static expiration check; real-time updates can wait for Sprint 6 persistence refresh
export default function MissionsPage() {
  const missions = useGameStore(state => state.missions);

  const activeMissions = missions.filter(m => !m.completed);
  const completedMissions = missions.filter(m => m.completed);

  return (
    <main style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Missions</h1>
      
      {activeMissions.length > 0 && (
        <section aria-labelledby="active-missions">
          <h2 id="active-missions" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Active</h2>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }} role="list">
            {activeMissions.map(mission => (
              <div
                key={mission.id}
                role="listitem"
                aria-label={`${mission.name}. ${mission.description}. Progress ${mission.progress} of ${mission.target}. Reward ${mission.rewardXp} XP`}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{mission.name}</h3>
                  <span style={{ fontSize: '0.875rem', color: '#666' }} aria-label={mission.type === 'daily' ? 'Daily mission' : 'Weekly mission'}>
                    {mission.type === 'daily' ? '📅 Daily' : '📆 Weekly'}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
                  {mission.description}
                </p>
                <div style={{ fontSize: '0.875rem', color: '#888' }}>
                  Progress: {mission.progress} / {mission.target}
                  <span style={{ marginLeft: '0.5rem' }}>+{mission.rewardXp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedMissions.length > 0 && (
        <section aria-labelledby="completed-missions">
          <h2 id="completed-missions" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Completed</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }} role="list">
            {completedMissions.map(mission => (
              <div
                key={mission.id}
                role="listitem"
                aria-label={`${mission.name}. Completed. ${mission.rewardXp} XP earned`}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  opacity: 0.6,
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
                  {mission.name} ✓
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                  +{mission.rewardXp} XP earned
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeMissions.length === 0 && completedMissions.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
          No missions available. Check back later!
        </p>
      )}
    </main>
  );
}

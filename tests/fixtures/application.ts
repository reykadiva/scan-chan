import type { AppDependencyMode } from '@/providers';

export const testModes = ['guest', 'arashu'] as const satisfies readonly AppDependencyMode[];

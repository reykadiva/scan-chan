import { describe, expect, it } from 'vitest';
import { createApplicationFlows } from '@/providers';
import { testModes } from '@tests/fixtures';
import { createTestAppContainer } from '@tests/helpers';
import { createMockServices } from '@tests/mocks';

describe('testing foundation', () => {
  it('creates app containers for each documented mode', () => {
    for (const mode of testModes) {
      expect(createTestAppContainer(mode).mode).toBe(mode);
    }
  });

  it('keeps flow controllers service-only and deterministic', () => {
    const flows = createApplicationFlows(createMockServices());

    expect(Object.keys(flows)).toContain('applicationStartup');
    expect(flows.applicationStartup.run()).toHaveLength(flows.applicationStartup.steps.length);
  });
});

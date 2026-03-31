import { test, expect } from './fixtures';
import { PlayerStats } from '../../src/components/PlayerStats';
import type { PlayerState } from '../../src/engine/types';

const makePlayerState = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  gold: 0,
  purchasedUpgrades: {},
  totalRuns: 0,
  bestRun: 0,
  healCharges: 0,
  ...overrides,
});

test('renders gold, best run and total runs', async ({ mount }) => {
  const component = await mount(
    <PlayerStats playerState={makePlayerState({ gold: 150, bestRun: 4, totalRuns: 7 })} />,
  );

  await expect(component.getByText('150')).toBeVisible();
  await expect(component.getByText('4')).toBeVisible();
  await expect(component.getByText('7')).toBeVisible();
});

test('renders stat labels', async ({ mount }) => {
  const component = await mount(
    <PlayerStats playerState={makePlayerState()} />,
  );

  await expect(component.getByText(/gold/i)).toBeVisible();
  await expect(component.getByText(/best run/i)).toBeVisible();
  await expect(component.getByText(/runs/i)).toBeVisible();
});

test('shows zero values when player state is empty', async ({ mount }) => {
  const component = await mount(
    <PlayerStats playerState={makePlayerState()} />,
  );

  const zeros = component.getByText('0');
  await expect(zeros).toHaveCount(3);
});

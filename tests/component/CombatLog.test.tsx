import { test, expect } from './fixtures';
import { CombatLog } from '../../src/components/CombatLog';
import type { CombatRound } from '../../src/engine/types';

const hitRound: CombatRound = {
  round: 1,
  firstAttacker: 'hero',
  heroAction: {
    type: 'hit',
    roll: 15,
    modifier: 5,
    total: 20,
    targetAC: 14,
    damageFormula: '1d8+3',
    damageRoll: 6,
    damageModifier: 3,
    damage: 9,
  },
  enemyAction: {
    type: 'miss',
    roll: 5,
    modifier: 2,
    total: 7,
    targetAC: 16,
  },
  heroHpAfter: 45,
  enemyHpAfter: 11,
};

const secondRound: CombatRound = {
  round: 2,
  firstAttacker: 'enemy',
  heroAction: {
    type: 'miss',
    roll: 3,
    modifier: 5,
    total: 8,
    targetAC: 14,
  },
  enemyAction: {
    type: 'hit',
    roll: 18,
    modifier: 2,
    total: 20,
    targetAC: 16,
    damageFormula: '1d6',
    damageRoll: 4,
    damageModifier: 0,
    damage: 4,
  },
  heroHpAfter: 41,
  enemyHpAfter: 11,
};

test('renders round number and firstAttacker', async ({ mount }) => {
  const component = await mount(
    <CombatLog rounds={[hitRound]} visibleCount={1} />,
  );

  await expect(component.getByText(/Round 1/)).toBeVisible();
  await expect(component.getByText(/hero/)).toBeVisible();
});

test('shows HIT action line', async ({ mount }) => {
  const component = await mount(
    <CombatLog rounds={[hitRound]} visibleCount={1} />,
  );

  await expect(component.getByText(/HIT/)).toBeVisible();
});

test('shows miss action line', async ({ mount }) => {
  const component = await mount(
    <CombatLog rounds={[hitRound]} visibleCount={1} />,
  );

  await expect(component.getByText(/miss/)).toBeVisible();
});

test('respects visibleCount — shows only the specified number of rounds', async ({ mount }) => {
  const rounds = [hitRound, secondRound];

  const component = await mount(
    <CombatLog rounds={rounds} visibleCount={1} />,
  );

  await expect(component.getByText(/Round 1/)).toBeVisible();
  await expect(component.getByText(/Round 2/)).not.toBeVisible();
});

test('shows multiple rounds when visibleCount allows', async ({ mount }) => {
  const rounds = [hitRound, secondRound];

  const component = await mount(
    <CombatLog rounds={rounds} visibleCount={2} />,
  );

  await expect(component.getByText(/Round 1/)).toBeVisible();
  await expect(component.getByText(/Round 2/)).toBeVisible();
});

test('renders empty log without errors', async ({ mount }) => {
  const component = await mount(
    <CombatLog rounds={[]} visibleCount={0} />,
  );

  await expect(component).toBeAttached();
});

test('handles null heroAction gracefully', async ({ mount }) => {
  const roundWithNullHero: CombatRound = {
    ...hitRound,
    heroAction: null,
  };

  const component = await mount(
    <CombatLog rounds={[roundWithNullHero]} visibleCount={1} />,
  );

  await expect(component.getByText(/Round 1/)).toBeVisible();
});

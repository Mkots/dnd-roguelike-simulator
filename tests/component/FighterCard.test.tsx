import { test, expect } from './fixtures';
import { FighterCard } from '../../src/components/FighterCard';

test('renders hero card with correct name and HP', async ({ mount }) => {
  const component = await mount(
    <FighterCard name="Aldric" currentHp={45} maxHp={50} isHero />,
  );

  await expect(component.getByTestId('fighter-card-hero-name')).toHaveText('Aldric');
  await expect(component.getByTestId('fighter-card-hero-hp-text')).toContainText('45 / 50 HP');
});

test('renders enemy card with correct name and HP', async ({ mount }) => {
  const component = await mount(
    <FighterCard name="Grukk the Moist" currentHp={12} maxHp={20} />,
  );

  await expect(component.getByTestId('fighter-card-enemy-name')).toHaveText('Grukk the Moist');
  await expect(component.getByTestId('fighter-card-enemy-hp-text')).toContainText('12 / 20 HP');
});

test('shows 0 HP when currentHp is negative', async ({ mount }) => {
  const component = await mount(
    <FighterCard name="Dead Enemy" currentHp={-5} maxHp={20} />,
  );

  await expect(component.getByTestId('fighter-card-enemy-hp-text')).toContainText('0 / 20 HP');
});

test('applies hero data-testid when isHero is true', async ({ mount }) => {
  const component = await mount(
    <FighterCard name="Hero" currentHp={10} maxHp={10} isHero />,
  );

  await expect(component).toHaveAttribute('data-testid', 'fighter-card-hero');
});

test('applies enemy data-testid by default', async ({ mount }) => {
  const component = await mount(
    <FighterCard name="Goblin" currentHp={8} maxHp={8} />,
  );

  await expect(component).toHaveAttribute('data-testid', 'fighter-card-enemy');
});


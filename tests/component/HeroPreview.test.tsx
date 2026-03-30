import { test, expect } from '@playwright/experimental-ct-react';
import { HeroPreview } from '../../src/components/HeroPreview';
import type { Creature } from '../../src/engine/types';

const heroFixture: Creature = {
  name: 'Aldric the Bold',
  maxHp: 45,
  currentHp: 45,
  armorClass: 15,
  attackBonus: 4,
  damageFormula: '1d8+2',
  abilities: {
    strength: 14,
    dexterity: 12,
    constitution: 13,
    intelligence: 10,
    wisdom: 11,
    charisma: 8,
  },
};

test('renders the Hero label', async ({ mount }) => {
  const component = await mount(<HeroPreview hero={heroFixture} />);

  await expect(component.getByText('Hero')).toBeVisible();
});

test('renders combat stats', async ({ mount }) => {
  const component = await mount(<HeroPreview hero={heroFixture} />);

  // Use toContainText on the component to avoid strict-mode issues
  // from values like armorClass that also appear in the ability scores grid
  await expect(component).toContainText('45');
  await expect(component).toContainText('15');
  await expect(component).toContainText('+4');
  await expect(component).toContainText('1d8+2');
});

test('renders stat labels', async ({ mount }) => {
  const component = await mount(<HeroPreview hero={heroFixture} />);

  await expect(component).toContainText('HP');
  await expect(component).toContainText('AC');
  await expect(component).toContainText('Attack');
  await expect(component).toContainText('Damage');
});

test('renders all six ability score abbreviations', async ({ mount }) => {
  const component = await mount(<HeroPreview hero={heroFixture} />);

  await expect(component.getByText('STR')).toBeVisible();
  await expect(component.getByText('DEX')).toBeVisible();
  await expect(component.getByText('CON')).toBeVisible();
  await expect(component.getByText('INT')).toBeVisible();
  await expect(component.getByText('WIS')).toBeVisible();
  await expect(component.getByText('CHA')).toBeVisible();
});

test('renders correct ability score modifiers', async ({ mount }) => {
  // STR 14 → +2, DEX 12 → +1, INT 10 → +0, WIS 11 → +0, CHA 8 → -1
  // Use exact matching to avoid substring collisions (e.g. "+2" inside "1d8+2")
  const component = await mount(<HeroPreview hero={heroFixture} />);

  await expect(component.getByText('+2', { exact: true })).toBeVisible();
  await expect(component.getByText('-1', { exact: true })).toBeVisible();
});


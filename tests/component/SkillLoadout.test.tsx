import { test, expect } from './fixtures';
import { SkillLoadout } from '../../src/components/SkillLoadout';

test('renders nothing when no skills are unlocked', async ({ mount }) => {
  const component = await mount(
    <SkillLoadout
      unlockedSkills={[]}
      equippedSkills={[]}
      onEquip={() => {}}
      onUnequip={() => {}}
    />,
  );
  await expect(component).not.toContainText('Skills');
});

test('renders skill buttons for unlocked skills', async ({ mount }) => {
  const component = await mount(
    <SkillLoadout
      unlockedSkills={['quick-jab']}
      equippedSkills={[]}
      onEquip={() => {}}
      onUnequip={() => {}}
    />,
  );
  await expect(component.getByText('Skills')).toBeVisible();
  await expect(component.locator('button')).toContainText('Quick Jab');
});

test('shows equipped count badge', async ({ mount }) => {
  const component = await mount(
    <SkillLoadout
      unlockedSkills={['quick-jab']}
      equippedSkills={['quick-jab']}
      onEquip={() => {}}
      onUnequip={() => {}}
    />,
  );
  await expect(component.getByText(/1\/2 equipped/)).toBeVisible();
});

test('calls onEquip when an unequipped skill button is clicked', async ({ mount }) => {
  let equipped = '';
  const component = await mount(
    <SkillLoadout
      unlockedSkills={['quick-jab']}
      equippedSkills={[]}
      onEquip={(id) => { equipped = id; }}
      onUnequip={() => {}}
    />,
  );
  await component.locator('button').click({ force: true });
  expect(equipped).toBe('quick-jab');
});

test('calls onUnequip when an equipped skill button is clicked', async ({ mount }) => {
  let unequipped = '';
  const component = await mount(
    <SkillLoadout
      unlockedSkills={['quick-jab']}
      equippedSkills={['quick-jab']}
      onEquip={() => {}}
      onUnequip={(id) => { unequipped = id; }}
    />,
  );
  await component.locator('button').click({ force: true });
  expect(unequipped).toBe('quick-jab');
});

test('disables unequipped skill buttons when at equip limit', async ({ mount }) => {
  // Unlock three skills; equip two (MAX=2), minor-shielding should be disabled
  const component = await mount(
    <SkillLoadout
      unlockedSkills={['quick-jab', 'second-wind', 'minor-shielding']}
      equippedSkills={['quick-jab', 'second-wind']}
      onEquip={() => {}}
      onUnequip={() => {}}
    />,
  );
  // SKILLS array order: quick-jab(0), minor-shielding(2), second-wind(4)
  // After filtering the 3 unlocked, rendered order: quick-jab(0), minor-shielding(1), second-wind(2)
  // minor-shielding is at index 1 and should be disabled (at equip limit, not equipped)
  const buttons = component.locator('button');
  const minorShieldingButton = buttons.nth(1);
  await expect(minorShieldingButton).toBeDisabled();
});

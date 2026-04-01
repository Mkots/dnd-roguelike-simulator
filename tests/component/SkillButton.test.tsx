import { test, expect } from './fixtures';
import { SkillButton } from '../../src/components/SkillButton';
import type { SkillDefinition } from '../../src/engine/types';

const skill: SkillDefinition = {
  id: 'quick-jab',
  name: 'Quick Jab',
  description: 'Deal +5 damage on the next attack',
  target: 'self',
  timing: 'pre-fight',
  effect: { type: 'damage-bonus-next', value: 5 },
  usesPerFight: 1,
};

// SkillButton's root element IS the <button>, so use `component` directly

test('renders skill name', async ({ mount }) => {
  const component = await mount(<SkillButton skill={skill} />);
  await expect(component).toContainText('Quick Jab');
});

test('shows uses remaining count when onUse provided', async ({ mount }) => {
  const component = await mount(
    <SkillButton skill={skill} usesRemaining={1} onUse={() => {}} />,
  );
  await expect(component).toContainText('Quick Jab (1)');
});

test('shows (Used) label when exhausted', async ({ mount }) => {
  const component = await mount(
    <SkillButton skill={skill} usesRemaining={0} onUse={() => {}} />,
  );
  await expect(component).toContainText('Used');
});

test('button is disabled when exhausted', async ({ mount }) => {
  const component = await mount(
    <SkillButton skill={skill} usesRemaining={0} onUse={() => {}} />,
  );
  await expect(component).toBeDisabled();
});

test('button is disabled when disabled prop is true', async ({ mount }) => {
  const component = await mount(<SkillButton skill={skill} disabled />);
  await expect(component).toBeDisabled();
});

test('calls onUse when clicked and onUse is provided', async ({ mount }) => {
  let called = false;
  const component = await mount(
    <SkillButton skill={skill} onUse={() => { called = true; }} />,
  );
  await component.click({ force: true });
  expect(called).toBe(true);
});

test('calls onEquip when not equipped and onEquip provided', async ({ mount }) => {
  let equipCalled = false;
  const component = await mount(
    <SkillButton skill={skill} equipped={false} onEquip={() => { equipCalled = true; }} />,
  );
  await component.click({ force: true });
  expect(equipCalled).toBe(true);
});

test('calls onUnequip when equipped and onUnequip provided', async ({ mount }) => {
  let unequipCalled = false;
  const component = await mount(
    <SkillButton skill={skill} equipped onUnequip={() => { unequipCalled = true; }} />,
  );
  await component.click({ force: true });
  expect(unequipCalled).toBe(true);
});

test('shows plain skill name when no onUse and no usesRemaining', async ({ mount }) => {
  const component = await mount(<SkillButton skill={skill} />);
  await expect(component).toContainText('Quick Jab');
});

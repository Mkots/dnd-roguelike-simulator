import { test, expect } from './fixtures';
import { GameTitle } from '../../src/components/GameTitle';

test('renders the game title', async ({ mount }) => {
  const component = await mount(<GameTitle />);

  await expect(component.getByText('DnD Roguelike')).toBeVisible();
  await expect(component.getByText('Simulator')).toBeVisible();
});

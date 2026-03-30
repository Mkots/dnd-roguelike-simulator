import { describe, it, expect } from 'vitest';
import { generateEnemyName } from '../../../src/engine/names';

describe('generateEnemyName', () => {
  it('returns a non-empty string', () => {
    // Arrange & Act
    const name = generateEnemyName('Goblin');

    // Assert
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('returns the type itself when the type has no name pool', () => {
    // Arrange & Act
    const name = generateEnemyName('Dragon');

    // Assert
    expect(name).toBe('Dragon');
  });

  it.each(['Goblin', 'Wolf', 'Orc', 'Skeleton', 'Troll', 'Ogre', 'Dark Knight'])(
    'generates a name for known type "%s"',
    (type) => {
      // Arrange & Act
      const name = generateEnemyName(type);

      // Assert
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    },
  );
});

import { describe, it, expect } from 'vitest';
import { createEnemies, ENEMY_COUNT } from '../../../src/engine/enemies';

describe('createEnemies', () => {
  it(`returns exactly ${ENEMY_COUNT} enemies`, () => {
    // Arrange & Act
    const enemies = createEnemies();

    // Assert
    expect(enemies).toHaveLength(ENEMY_COUNT);
  });

  it('each enemy has required Creature fields', () => {
    // Arrange & Act
    const enemies = createEnemies();

    // Assert
    enemies.forEach(enemy => {
      expect(typeof enemy.name).toBe('string');
      expect(enemy.name.length).toBeGreaterThan(0);
      expect(typeof enemy.maxHp).toBe('number');
      expect(enemy.maxHp).toBeGreaterThan(0);
      expect(enemy.currentHp).toBe(enemy.maxHp);
      expect(typeof enemy.armorClass).toBe('number');
      expect(typeof enemy.attackBonus).toBe('number');
      expect(typeof enemy.damageFormula).toBe('string');
      expect(enemy.damageFormula.length).toBeGreaterThan(0);
    });
  });

  it('each enemy has a kind assigned', () => {
    // Arrange & Act
    const enemies = createEnemies();

    // Assert
    enemies.forEach(enemy => {
      expect(enemy.kind).toBeDefined();
      expect(typeof enemy.kind).toBe('string');
    });
  });

  it('enemies have unique names across calls (fresh randomisation)', () => {
    // Arrange & Act
    const runA = createEnemies().map(e => e.name);
    const runB = createEnemies().map(e => e.name);

    // Assert — statistically very unlikely to be identical across two runs
    expect(runA).not.toEqual(runB);
  });

  it('last enemy has highest armor class (dark knight)', () => {
    // Arrange & Act
    const enemies = createEnemies();
    const lastAC = enemies[enemies.length - 1].armorClass;

    // Assert — dark knight has the highest AC of all enemies
    enemies.slice(0, -1).forEach(e => {
      expect(lastAC).toBeGreaterThanOrEqual(e.armorClass);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { SKILLS, getSkillById, DEFAULT_UNLOCKED_SKILLS, MAX_EQUIPPED_SKILLS } from '../../../src/engine/skills';

describe('SKILLS', () => {
  it('contains at least one skill', () => {
    expect(SKILLS.length).toBeGreaterThan(0);
  });

  it('every skill has required fields', () => {
    for (const skill of SKILLS) {
      expect(skill.id).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.effect).toBeDefined();
      expect(skill.usesPerFight).toBeGreaterThan(0);
    }
  });
});

describe('getSkillById', () => {
  it('returns the matching skill when found', () => {
    const skill = getSkillById('quick-jab');
    expect(skill).toBeDefined();
    expect(skill?.id).toBe('quick-jab');
  });

  it('returns undefined for an unknown id', () => {
    expect(getSkillById('does-not-exist')).toBeUndefined();
  });
});

describe('DEFAULT_UNLOCKED_SKILLS', () => {
  it('is a non-empty array of skill ids', () => {
    expect(DEFAULT_UNLOCKED_SKILLS.length).toBeGreaterThan(0);
  });

  it('each default unlocked skill exists in SKILLS', () => {
    for (const id of DEFAULT_UNLOCKED_SKILLS) {
      expect(getSkillById(id)).toBeDefined();
    }
  });
});

describe('MAX_EQUIPPED_SKILLS', () => {
  it('is a positive integer', () => {
    expect(MAX_EQUIPPED_SKILLS).toBeGreaterThan(0);
    expect(Number.isInteger(MAX_EQUIPPED_SKILLS)).toBe(true);
  });
});

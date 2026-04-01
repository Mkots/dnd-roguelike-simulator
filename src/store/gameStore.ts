import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerState, Creature } from '../engine/types';
import type { HeroConfig } from '../engine/shop';
import {
  createInitialPlayerState,
  buildHero,
  collectRunRewards,
  purchase,
  buyHealCharge as buyHealChargeFromShop,
} from '../engine/shop';
import { WEAPON_PROGRESSION } from '../engine/upgrades';
import { MAX_EQUIPPED_SKILLS } from '../engine/skills';

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  name: 'Hero',
  kind: 'hero',
  baseAbilities: {
    strength:     14,
    dexterity:    12,
    constitution: 12,
    intelligence: 10,
    wisdom:       10,
    charisma:     8,
  },
  hitDie: 10,
  attackAbility: 'strength',
  baseWeaponDice: WEAPON_PROGRESSION[1], // 1d6
};

type GameStore = {
  playerState: PlayerState;
  getHero: () => Creature;
  collectRewards: (enemiesDefeated: number, exitType: 'survived' | 'died' | 'early-exit') => void;
  buyUpgrade: (upgradeId: string) => boolean;
  buyHealCharge: () => boolean;
  spendHealCharge: () => boolean;
  equipSkill: (skillId: string) => boolean;
  unequipSkill: (skillId: string) => void;
  resetProgress: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      playerState: createInitialPlayerState(),

      getHero: () => buildHero(DEFAULT_HERO_CONFIG, get().playerState),

      collectRewards: (enemiesDefeated, exitType) =>
        set(s => ({
          playerState: collectRunRewards(s.playerState, enemiesDefeated, exitType),
        })),

      buyUpgrade: (upgradeId) => {
        const result = purchase(get().playerState, upgradeId);
        if (result.success) set({ playerState: result.playerState });
        return result.success;
      },

      buyHealCharge: () => {
        const result = buyHealChargeFromShop(get().playerState);
        if (result.success) set({ playerState: result.playerState });
        return result.success;
      },

      spendHealCharge: () => {
        const { playerState } = get();
        if (playerState.healCharges <= 0) return false;
        set(s => ({
          playerState: { ...s.playerState, healCharges: s.playerState.healCharges - 1 },
        }));
        return true;
      },

      equipSkill: (skillId) => {
        const { playerState } = get();

        // Check if skill is unlocked
        if (!playerState.unlockedSkills.includes(skillId)) return false;

        // Check if already equipped
        if (playerState.equippedSkills.includes(skillId)) return true;

        // Check if we've reached the limit
        if (playerState.equippedSkills.length >= MAX_EQUIPPED_SKILLS) return false;

        set(s => ({
          playerState: {
            ...s.playerState,
            equippedSkills: [...s.playerState.equippedSkills, skillId],
          },
        }));
        return true;
      },

      unequipSkill: (skillId) => {
        set(s => ({
          playerState: {
            ...s.playerState,
            equippedSkills: s.playerState.equippedSkills.filter(id => id !== skillId),
          },
        }));
      },

      resetProgress: () => set({ playerState: createInitialPlayerState() }),
    }),
    { name: 'dnd-roguelike-save' }
  )
);

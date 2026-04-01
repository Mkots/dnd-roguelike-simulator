import { SKILLS, MAX_EQUIPPED_SKILLS } from '@/engine/skills';
import { SkillButton } from './SkillButton';

type SkillLoadoutProps = {
  unlockedSkills: string[];
  equippedSkills: string[];
  onEquip: (skillId: string) => void;
  onUnequip: (skillId: string) => void;
};

export function SkillLoadout({
  unlockedSkills,
  equippedSkills,
  onEquip,
  onUnequip,
}: SkillLoadoutProps) {
  const unlocked = SKILLS.filter(s => unlockedSkills.includes(s.id));
  const canEquipMore = equippedSkills.length < MAX_EQUIPPED_SKILLS;

  if (unlocked.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Skills</h3>
        <span className="text-xs text-muted-foreground">
          {equippedSkills.length}/{MAX_EQUIPPED_SKILLS} equipped
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {unlocked.map(skill => {
          const equipped = equippedSkills.includes(skill.id);
          const disabled = !equipped && !canEquipMore;

          return (
            <SkillButton
              key={skill.id}
              skill={skill}
              equipped={equipped}
              disabled={disabled}
              onEquip={() => onEquip(skill.id)}
              onUnequip={() => onUnequip(skill.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

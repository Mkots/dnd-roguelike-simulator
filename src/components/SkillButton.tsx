import type { SkillDefinition } from '@/engine/types';
import { Button } from '@/components/ui/button';

type SkillButtonProps = {
  skill: SkillDefinition;
  usesRemaining?: number;
  disabled?: boolean;
  equipped?: boolean;
  onUse?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
};

export function SkillButton({
  skill,
  usesRemaining,
  disabled = false,
  equipped = false,
  onUse,
  onEquip,
  onUnequip,
}: SkillButtonProps) {
  const handleClick = () => {
    if (onUse) {
      onUse();
    } else if (equipped && onUnequip) {
      onUnequip();
    } else if (!equipped && onEquip) {
      onEquip();
    }
  };

  const isExhausted = usesRemaining !== undefined && usesRemaining <= 0;

  let buttonText = skill.name;
  if (onUse) {
    if (isExhausted) {
      buttonText = `${skill.name} (Used)`;
    } else if (usesRemaining !== undefined) {
      buttonText = `${skill.name} (${usesRemaining})`;
    }
  }

  return (
    <Button
      variant={equipped ? 'default' : 'outline'}
      size="sm"
      className="text-xs h-9"
      onClick={handleClick}
      disabled={disabled || isExhausted}
      title={skill.description}
    >
      {buttonText}
    </Button>
  );
}

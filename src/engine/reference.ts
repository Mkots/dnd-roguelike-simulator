// DND Rogue-like sim

type Creature = {
  health: number;
  maxDamage: number;
  armorClass: number;
}

const fight = (hero: Creature, enemy: Creature): {hero: Creature, enemy: Creature} => {
  const isHeroShoot   = (Math.random() * 20 | 0) > enemy.armorClass
  const isEnemyShoot  = (Math.random() * 20 | 0) > hero.armorClass

  if(isHeroShoot) return {hero, enemy: {
    health: enemy.health - (Math.random() * hero.maxDamage | 0),
    maxDamage: enemy.maxDamage,
    armorClass: enemy.armorClass
  }}
  if(isEnemyShoot) return {enemy, hero: {
    health: hero.health - (Math.random() * enemy.maxDamage | 0),
    maxDamage: hero.maxDamage,
    armorClass: hero.armorClass
  }}
  return {hero, enemy}
}

const simulate = () => {
  let hero: Creature = {
    health: 10,
    maxDamage: 4,
    armorClass: 12
  }
  let enemy: Creature = {
    health: 10,
    maxDamage: 2,
    armorClass: 6
  }
  while(hero.health > 0 && enemy.health > 0){
    const result = fight(hero, enemy)
    hero = result.hero;
    enemy = result.enemy
    console.log(result)
  }
  
}

simulate()
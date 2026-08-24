import { CharacterProfile, DamageType, Rarity, Role } from '@td-nya/shared';

export const Sound: CharacterProfile = {
  id: 'sound', name: 'Sound', title: 'Santo del Nya', rarity: Rarity.SSR,
  roles: [Role.DPS, Role.SUPPORT], damageType: DamageType.MAGICAL,
  description: 'Un artista de precisión que estudia, marca y perfecciona sus ataques contra objetivos importantes.',
  baseStats: { hp: 900, attack: 105, defense: 55, magicDefense: 110, range: 320, attackSpeed: 1.1, moveSpeed: 0 },
  skills: [
    { id: 'sacred-trace', name: 'Trazo Sagrado', type: 'passive', passiveTrigger: 'on_attack', particleColor: 0xfff59e, description: 'Sus ataques aplican Marca Sagrada y aumentan su precisión contra el objetivo.', effect: { damageMultiplier: 1.15 } },
    { id: 'perfect-sketch', name: 'Boceto Perfecto', type: 'passive', passiveTrigger: 'on_attack', particleColor: 0xfef3c7, description: 'Mantener la presión ofensiva mejora progresivamente el daño de Sound.', effect: { attackBoost: 0.15 } },
    { id: 'tireless-artist', name: 'Artista Incansable', type: 'passive', passiveTrigger: 'always', particleColor: 0xfde68a, description: 'Sound gana velocidad y daño mientras permanece activo en el campo.', effect: { attackBoost: 0.1, speedBoost: 0.1 } },
    { id: 'divine-illustration', name: 'Ilustración Divina', type: 'active', cooldownMs: 10000, flavorText: '¡Que cobre vida!', description: 'Materializa una ilustración que golpea en área y marca a los enemigos.', effect: { damageMultiplier: 2.5, aoeMultiplier: 2 } },
    { id: 'masterpiece', name: 'Obra Maestra', type: 'active', cooldownMs: 22000, flavorText: 'Esta es mi obra maestra.', description: 'Libera una creación máxima: gran daño en área y amplificación contra enemigos marcados.', effect: { damageMultiplier: 4, aoeMultiplier: 2 } },
  ],
};

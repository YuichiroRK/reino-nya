import { CharacterProfile, DamageType, Rarity, Role } from '@td-nya/shared';

export const Xavi: CharacterProfile = {
  id: 'xavi',
  name: 'Xavi',
  title: 'Mosasaurio del Nya',
  rarity: Rarity.SSR,
  roles: [Role.AOE_DPS, Role.SUPPORT, Role.COMMANDER],
  damageType: DamageType.MAGICAL,
  description: 'Un druida del agua que lucha junto a sus pequeños mosasaurios y transforma el campo de batalla.',
  baseStats: { hp: 1500, attack: 95, defense: 90, magicDefense: 120, range: 260, attackSpeed: 0.85, moveSpeed: 0 },
  skills: [
    { id: 'abyss-companions', name: 'Compañeros del Abismo', type: 'passive', passiveTrigger: 'always', particleColor: 0x29b6f6, description: 'Mantiene hasta tres mini-mosasaurios que atacan automáticamente a los enemigos cercanos.', effect: { summonCount: 3 } },
    { id: 'free-spirit', name: 'Espíritu Libre', type: 'passive', passiveTrigger: 'on_attack', particleColor: 0x80deea, description: 'Cada ataque mantiene el ritmo de Xavi y reduce ligeramente su tiempo de reutilización.', effect: { speedBoost: 0.1 } },
    { id: 'pack-bite', name: 'Mordida de la Manada', type: 'active', cooldownMs: 7000, flavorText: 'Chicos, es hora.', description: 'Ordena a sus mosasaurios atacar simultáneamente al objetivo más cercano.', effect: { damageMultiplier: 2 } },
    { id: 'wild-current', name: 'Corriente Salvaje', type: 'active', cooldownMs: 9000, flavorText: '¡A nadar!', description: 'Una corriente de agua daña y ralentiza a todos los enemigos dentro del área.', effect: { aoeMultiplier: 1.5, slowPercent: 0.35 } },
    { id: 'call-of-abyss', name: 'Llamado del Abismo', type: 'active', cooldownMs: 12000, flavorText: 'Vamos, pequeños.', description: 'Invoca temporalmente un mosasaurio grande que ataca por su cuenta.', effect: { summonCount: 1 } },
    { id: 'mosasaur-era', name: 'Era del Mosasaurio', type: 'active', cooldownMs: 22000, flavorText: 'Es hora de recordar la era de los gigantes.', description: 'Transforma a Xavi temporalmente: aumenta su daño y convierte sus ataques en daño de área.', effect: { damageMultiplier: 2, aoeMultiplier: 1.5, transformation: true } },
  ],
};

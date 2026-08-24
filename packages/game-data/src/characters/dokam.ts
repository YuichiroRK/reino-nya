import { CharacterProfile, DamageType, Rarity, Role } from '@td-nya/shared';

export const Dokam: CharacterProfile = {
  id: 'dokam', name: 'Dokam', title: 'Fénix Turbo Power del Nya', rarity: Rarity.SSR,
  roles: [Role.DPS, Role.AOE_DPS], damageType: DamageType.MAGICAL,
  description: 'Un carry de fuego que acumula Turbo y escala hasta convertirse en una explosión viviente.',
  baseStats: { hp: 1000, attack: 120, defense: 60, magicDefense: 90, range: 270, attackSpeed: 0.9, moveSpeed: 0 },
  skills: [
    { id: 'phoenix-rebirth', name: 'Renacer del Fénix', type: 'passive', passiveTrigger: 'low_hp', particleColor: 0xff7043, description: 'Al caer en peligro, activa una defensa de fuego y prepara su regreso.', effect: { defenseBoost: 0.35 } },
    { id: 'high-level-gamer', name: 'Gamer de Alto Nivel', type: 'passive', passiveTrigger: 'on_attack', particleColor: 0xffab40, description: 'Mantener una racha de ataques aumenta su daño y velocidad.', effect: { attackBoost: 0.15, speedBoost: 0.1 } },
    { id: 'turbo-boost', name: 'Turbo Boost', type: 'active', cooldownMs: 8000, flavorText: '¡Turbo Boost!', description: 'Aumenta temporalmente el daño y la velocidad de ataque de Dokam.', effect: { attackBoost: 0.4, speedBoost: 0.5 } },
    { id: 'phoenix-burst', name: 'Fénix Burst', type: 'active', cooldownMs: 11000, flavorText: '¡Fénix Burst!', description: 'Explosión ígnea de gran daño que afecta en área.', effect: { damageMultiplier: 3, aoeMultiplier: 2 } },
    { id: 'overclock', name: 'Overclock', type: 'active', cooldownMs: 18000, flavorText: '¡Overclock!', description: 'Fuerza sus límites: ataca mucho más rápido y golpea objetivos adicionales.', effect: { speedBoost: 1, damageMultiplier: 2, aoeMultiplier: 1 } },
    { id: 'turbo-power', name: 'PHOENIX TURBO POWER', type: 'active', cooldownMs: 30000, flavorText: '¡PHOENIX TURBO POWER!', description: 'Libera el poder máximo del Fénix con daño masivo y área explosiva.', effect: { damageMultiplier: 5, aoeMultiplier: 2, transformation: true } },
  ],
};

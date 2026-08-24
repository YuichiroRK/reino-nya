import { CharacterProfile, DamageType, Rarity, Role } from '@td-nya/shared';

export const Champa: CharacterProfile = {
  id: 'champa', name: 'Champa', title: 'Soldado del Nya', rarity: Rarity.R,
  roles: [Role.DPS, Role.TANK], damageType: DamageType.PHYSICAL,
  description: 'Un soldado híbrido que alterna entre presión cuerpo a cuerpo y ataques a distancia.',
  baseStats: { hp: 1100, attack: 70, defense: 75, magicDefense: 55, range: 150, attackSpeed: 1.0, moveSpeed: 0 },
  skills: [
    { id: 'indecision', name: 'Indecisión', type: 'passive', passiveTrigger: 'always', particleColor: 0xa5b4fc, description: 'Adapta su estilo y obtiene un equilibrio entre daño, rango y resistencia.', effect: { attackBoost: 0.1, rangeBoost: 0.15, defenseBoost: 0.1 } },
    { id: 'close-combat', name: 'Combate Cercano', type: 'active', cooldownMs: 7000, flavorText: 'Me acerco... ¡ahora!', description: 'Potencia el siguiente golpe y adopta una postura ofensiva.', effect: { damageMultiplier: 2 } },
    { id: 'distance-combat', name: 'Combate a Distancia', type: 'active', cooldownMs: 7000, flavorText: 'Mejor desde aquí.', description: 'Lanza un proyectil reforzado y obtiene alcance temporal.', effect: { damageMultiplier: 1.8, rangeBoost: 0.25 } },
  ],
};

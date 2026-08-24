import { CharacterProfile, DamageType, Rarity, Role } from '@td-nya/shared';

export const Rafael: CharacterProfile = {
  id: 'rafael', name: 'Rafael', title: 'Abogado del Nya', rarity: Rarity.R,
  roles: [Role.DEBUFFER, Role.SUPPORT], damageType: DamageType.MAGICAL,
  description: 'Un controlador metódico que convierte las reglas del combate en contratos contra los enemigos.',
  baseStats: { hp: 750, attack: 40, defense: 45, magicDefense: 100, range: 280, attackSpeed: 0.8, moveSpeed: 0 },
  skills: [
    { id: 'binding-contract', name: 'Contrato Vinculante', type: 'passive', passiveTrigger: 'on_attack', particleColor: 0x60a5fa, description: 'Marca al enemigo atacado y reduce su amenaza mediante un contrato.', effect: { attackBoost: 0.08 } },
    { id: 'objection', name: 'Objeción', type: 'active', cooldownMs: 8000, flavorText: '¡Objeción!', description: 'Interrumpe al enemigo objetivo y lo deja aturdido brevemente.', effect: { damageMultiplier: 1.5 } },
    { id: 'additional-clause', name: 'Cláusula Adicional', type: 'active', cooldownMs: 10000, flavorText: 'Técnicamente...', description: 'Añade una cláusula que ralentiza y marca a los enemigos en rango.', effect: { aoeMultiplier: 1, slowPercent: 0.3 } },
    { id: 'sentence', name: 'Sentencia', type: 'active', cooldownMs: 16000, flavorText: 'Se dicta sentencia.', description: 'Castiga al enemigo marcado con un golpe de daño aumentado.', effect: { damageMultiplier: 3 } },
  ],
};

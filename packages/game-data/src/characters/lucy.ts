import { CharacterProfile, Rarity, Role, DamageType } from "@td-nya/shared";

export const Lucy: CharacterProfile = {
  id: "lucy",
  name: "Lucy",
  title: "Duquesa del nya",
  rarity: Rarity.SR,
  roles: [Role.SUPPORT, Role.HEALER],
  damageType: DamageType.MAGICAL,
  description: "No necesito ser la más fuerte. Solo necesito asegurarme de que ustedes puedan seguir luchando. Cura y potencia aliados en combates largos.",
  baseStats: {
    hp: 800,
    attack: 45,
    defense: 50,
    magicDefense: 100,
    range: 250,        // Medium range for healing
    attackSpeed: 0.9,
    moveSpeed: 0,      // Static tower-like placement
  },
  skills: [
    { id: "sweet-comfort", name: "Dulce Consuelo", type: "passive", passiveTrigger: "low_hp", particleColor: 0x66bb6a, effect: { healAmount: 30 } },
    { id: "heart-bond", name: "Lazo del Corazón", type: "active", cooldownMs: 11000, flavorText: "Lazo del Corazón.", effect: { attackBoost: 0.2, defenseBoost: 0.2 } },
    { id: "shared-regeneration", name: "Regeneración Compartida", type: "passive", passiveTrigger: "always", particleColor: 0xa5d6a7, effect: { defenseBoost: 0.1 } },
    { id: "shared-dream", name: "Sueño Compartido", type: "active", cooldownMs: 9000, flavorText: "Quizás no pueda luchar…", effect: { healAmount: 50 } },
    { id: "nya-promise", name: "Promesa del Nya", type: "active", cooldownMs: 20000, flavorText: "Promesa del Nya.", effect: { healAmount: 120, attackBoost: 0.25, defenseBoost: 0.25 } },
  ],
};

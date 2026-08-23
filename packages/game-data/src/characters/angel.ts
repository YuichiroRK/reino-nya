import { CharacterProfile, Rarity, Role, DamageType } from "@td-nya/shared";

export const Angel: CharacterProfile = {
  id: "angel",
  name: "Angel",
  title: "Reina del Nya",
  rarity: Rarity.SSR,
  roles: [Role.SUPPORT, Role.BUFFER],
  damageType: DamageType.MAGICAL,
  description: "Una reina celestial que obtiene su fuerza de aquellos a quienes protege. Su poder crece cuando está rodeada de su ejército.",
  baseStats: {
    hp: 1200,
    attack: 60,
    defense: 80,
    magicDefense: 150,
    range: 300,        // High range for aura
    attackSpeed: 0.8,  // Moderate attack speed
    moveSpeed: 0,      // Static tower-like placement
  },
};

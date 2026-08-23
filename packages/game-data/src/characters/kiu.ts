import { CharacterProfile, Rarity, Role, DamageType } from "@td-nya/shared";

export const Kiu: CharacterProfile = {
  id: "kiu",
  name: "Kiu",
  title: "Subcapitán del Nya",
  rarity: Rarity.SR,
  roles: [Role.DPS],
  damageType: DamageType.PHYSICAL,
  description:
    "Subcapitán del Nya y DPS de ballesta experimental. Tiene una enorme confianza en su puntería y aún más en sus propias ideas. No siempre sabe qué está haciendo, pero casi siempre encuentra la manera de que funcione.",
  baseStats: {
    hp: 700,
    attack: 110,        // Alto daño individual — sniper de ballesta
    defense: 50,
    magicDefense: 45,
    range: 350,         // Mayor alcance del equipo — mantiene distancia
    attackSpeed: 1.4,   // Rápido pero preciso
    moveSpeed: 0,
  },
};

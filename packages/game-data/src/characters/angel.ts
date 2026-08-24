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
    range: 180,        // Aura de reina — media distancia, buffea a los aliados cercanos
    attackSpeed: 0.8,  // Moderate attack speed
    moveSpeed: 0,      // Static tower-like placement
  },
  skills: [
    { id: "blessing", name: "Bendición de la Reina", type: "passive", passiveTrigger: "ally_nearby", particleColor: 0xffd54f, description: "Genera Favor y aumenta el daño, velocidad y regeneración de los aliados cercanos.", effect: { attackBoost: 0.2, speedBoost: 0.1 } },
    { id: "feline-instinct", name: "Instinto Felino", type: "passive", passiveTrigger: "always", particleColor: 0xfff8bb, effect: { defenseBoost: 0.15 } },
    { id: "for-nya", name: "¡Por mi ejército!", type: "active", cooldownMs: 8000, flavorText: "¡Nadie toca a mi ejército, nya!", effect: { attackBoost: 0.4, speedBoost: 0.25, healAmount: 100, damageTakenMultiplier: 0.8 } },
    { id: "queen-favor", name: "Favor de la Reina", type: "passive", passiveTrigger: "always", particleColor: 0xffecb3, description: "Acumula Favor cuando el ejército cercano lucha y potencia la siguiente descarga celestial.", effect: { attackBoost: 0.1 } },
    { id: "nya-miracle", name: "Milagro del Nya", type: "active", cooldownMs: 24000, flavorText: "¡Milagro del Nya!", effect: { attackBoost: 0.6, speedBoost: 0.35, healAmount: 180, damageTakenMultiplier: 0.7 } },
  ],
};

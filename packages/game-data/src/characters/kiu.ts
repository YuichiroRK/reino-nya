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
  skills: [
    { id: "experimental-ammo", name: "Munición Experimental", type: "passive", passiveTrigger: "on_attack", particleColor: 0xff9800, effect: { damageMultiplier: 2 } },
    { id: "idea", name: "¡Tengo una idea!", type: "active", cooldownMs: 10000, flavorText: "¡Tengo una idea!", effect: { damageMultiplier: 3 } },
    { id: "piercing-bolt", name: "Virote Perforante", type: "active", cooldownMs: 7000, flavorText: "¡Atraviesa todo!", effect: { damageMultiplier: 2, aoeMultiplier: 1 } },
    { id: "explosive-bolt", name: "Virote Explosivo", type: "active", cooldownMs: 8500, flavorText: "¡Que explote!", effect: { damageMultiplier: 1.5, aoeMultiplier: 2 } },
    { id: "heavy-bolt", name: "Virote Pesado", type: "active", cooldownMs: 12000, flavorText: "Virote pesado.", effect: { damageMultiplier: 4 } },
    { id: "control-bolt", name: "Virote de Control", type: "active", cooldownMs: 9000, flavorText: "No te muevas.", effect: { damageMultiplier: 1.25, slowPercent: 0.35 } },
  ],
};

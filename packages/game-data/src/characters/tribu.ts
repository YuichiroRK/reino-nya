import { CharacterProfile, Rarity, Role, DamageType } from "@td-nya/shared";

export const Tribu: CharacterProfile = {
  id: "tribu",
  name: "Tribu",
  title: "Capitán del Nya",
  rarity: Rarity.SSR,
  roles: [Role.COMMANDER, Role.BUFFER, Role.SUPPORT],
  damageType: DamageType.PHYSICAL,
  description:
    "El Capitán del Nya. No necesita el mayor daño — necesita entender el campo de batalla mejor que el enemigo. Su Adaptación Táctica convierte cualquier composición en una fuerza coordinada.",
  baseStats: {
    hp: 1000,
    attack: 75,         // Moderado — su poder real es buffear aliados
    defense: 90,
    magicDefense: 70,
    range: 240,         // Segunda línea: alcance amplio para cubrir aliados
    attackSpeed: 1.0,
    moveSpeed: 0,
  },
  skills: [
    { id: "tactical-adaptation", name: "Adaptación Táctica", type: "passive", passiveTrigger: "always", particleColor: 0x42a5f5, effect: { attackBoost: 0.15 } },
    { id: "regroup", name: "¡Reagrupación!", type: "active", cooldownMs: 9000, flavorText: "¡Reagrupación!", effect: { speedBoost: 0.5 } },
  ],
};

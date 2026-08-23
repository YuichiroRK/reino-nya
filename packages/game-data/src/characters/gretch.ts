import { CharacterProfile, Rarity, Role, DamageType } from "@td-nya/shared";

export const Gretch: CharacterProfile = {
  id: "gretch",
  name: "Gretch",
  title: "Princesa del Nya",
  rarity: Rarity.SSR,
  roles: [Role.AOE_DPS, Role.BUFFER],
  damageType: DamageType.MAGICAL,
  description:
    "La Princesa del Nya. Espontánea, idealista y explosivamente poderosa. Buffea al equipo mientras destruye grupos enteros de enemigos con magia AOE. Su magia reacciona emocionalmente ante el peligro.",
  baseStats: {
    hp: 850,
    attack: 130,        // El mayor daño mágico del equipo — AOE masivo
    defense: 60,
    magicDefense: 100,
    range: 250,         // Área media — necesita estar cerca para apoyar aliados
    attackSpeed: 0.7,   // Ataques lentos pero devastadores en área
    moveSpeed: 0,
  },
  skills: [
    { id: "enthusiasm", name: "Entusiasmo", type: "passive", passiveTrigger: "ally_nearby", particleColor: 0xec407a, effect: { aoeMultiplier: 2 } },
    { id: "princess-magic", name: "Magia de la Princesa", type: "passive", passiveTrigger: "on_attack", particleColor: 0xf48fb1, effect: { attackBoost: 0.1 } },
    { id: "miracle", name: "Milagro", type: "passive", passiveTrigger: "low_hp", particleColor: 0xff80ab, effect: { attackBoost: 0.25, rangeBoost: 0.2 } },
    { id: "lets-go", name: "¡Vamos, Nya!", type: "active", cooldownMs: 9000, flavorText: "¡Vamos, Nya!", effect: { aoeMultiplier: 1 } },
    { id: "princess-arc", name: "Arco de la Princesa", type: "active", cooldownMs: 12000, flavorText: "Arco de la Princesa.", effect: { damageMultiplier: 3, aoeMultiplier: 2 } },
  ],
};

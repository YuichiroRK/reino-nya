import { CharacterProfile, Rarity, Role, DamageType } from "@td-nya/shared";

export const Cesar: CharacterProfile = {
  id: "cesar",
  name: "Cesar",
  title: "Soldado del Nya",
  rarity: Rarity.R,
  roles: [Role.TANK],
  damageType: DamageType.PHYSICAL,
  description:
    "Un Bruiser/Tank de primera línea con energía de protagonista de shonen. No destaca eliminando enemigos, sino en no caer jamás. Grita el nombre de sus ataques, absorbe golpes descomunales y sigue avanzando.",
  baseStats: {
    hp: 2500,           // El mayor HP del equipo — es literalmente una pared
    attack: 55,         // Daño moderado constante — no es un DPS
    defense: 200,       // Máxima defensa física
    magicDefense: 80,
    range: 64,          // Solo alcanza la casilla adyacente — cuerpo a cuerpo
    attackSpeed: 0.6,   // Lento, pesado — golpes de espadón
    moveSpeed: 0,
  },
};

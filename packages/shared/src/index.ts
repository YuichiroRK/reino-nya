export const SHARED_VERSION = "1.0.0";

// Basic enums for targeting
export enum TargetingPriority {
  MOST_HP = "MOST_HP",
  LEAST_HP = "LEAST_HP",
  CLOSEST = "CLOSEST",
  FARTHEST = "FARTHEST",
  STRONGEST = "STRONGEST",
  WEAKEST = "WEAKEST",
  CLOSEST_TO_CORE = "CLOSEST_TO_CORE",
  FARTHEST_FROM_CORE = "FARTHEST_FROM_CORE",
  FASTEST = "FASTEST"
}

// Character Enums
export enum Rarity {
  R = "R",
  SR = "SR",
  SSR = "SSR",
}

export enum Role {
  DPS = "DPS",
  SUPPORT = "SUPPORT",
  HEALER = "HEALER",
  TANK = "TANK",
  BUFFER = "BUFFER",
  DEBUFFER = "DEBUFFER",
}

export enum DamageType {
  PHYSICAL = "PHYSICAL",
  MAGICAL = "MAGICAL",
  PURE = "PURE",
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  magicDefense: number;
  range: number;
  attackSpeed: number; // Attacks per second
  moveSpeed: number; // Movement speed (0 for static towers)
}

export interface CharacterProfile {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  roles: Role[];
  damageType: DamageType;
  baseStats: BaseStats;
  description: string;
  // Further details like skills will be added here
}

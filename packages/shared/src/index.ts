export const SHARED_VERSION = "1.0.0";

// Basic enums for targeting
export enum TargetingPriority {
  HIGHEST_HP        = "HIGHEST_HP",
  LOWEST_HP         = "LOWEST_HP",
  CLOSEST_TO_TOWER  = "CLOSEST_TO_TOWER",
  FARTHEST_FROM_CORE = "FARTHEST_FROM_CORE",
  CLOSEST_TO_CORE   = "CLOSEST_TO_CORE",
  FASTEST           = "FASTEST",
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
  COMMANDER = "COMMANDER",
  AOE_DPS = "AOE_DPS",
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
  skills?: Skill[];
}

// ─── Skill System ─────────────────────────────────────────────────────────────

export type PassiveTrigger = 'always' | 'ally_nearby' | 'on_attack' | 'low_hp';

export interface SkillEffect {
  attackBoost?: number;
  defenseBoost?: number;
  speedBoost?: number;
  healAmount?: number;
  aoeMultiplier?: number;
  damageMultiplier?: number;
  damageTakenMultiplier?: number;
  rangeBoost?: number;
  slowPercent?: number;
}

export interface Skill {
  id: string;
  name: string;
  type: 'passive' | 'active';
  passiveTrigger?: PassiveTrigger;
  cooldownMs?: number;
  particleColor?: number;
  flavorText?: string;
  description?: string;
  effect: SkillEffect;
}

export type EnemyType = 'basic' | 'runner' | 'armored' | 'flying' | 'boss';
export type EnemyMovement = 'ground' | 'flying';
export type EnemyAbility = 'dash' | 'shield' | 'swarm' | 'rage';
export type SkillTargetPriority = 'weakest' | 'closest' | 'strongest' | 'all';

export interface EnemyProfile {
  id: string;
  name: string;
  type: EnemyType;
  movement: EnemyMovement;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackCooldownMs: number;
  color: number;
  defense?: number;
  reward: number;
  ability?: EnemyAbility;
}

export interface WaveEntry {
  enemyId: string;
  count: number;
  intervalMs?: number;
}

export interface WaveDefinition {
  number: number;
  entries: WaveEntry[];
}

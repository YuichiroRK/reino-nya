import { TargetingPriority } from "@td-nya/shared";

export const GameConstants = {
  // Classic TD values for initialization
  JEWEL_MAX_HP: 100,
  JEWEL_MAX_SHIELD: 50,
  FORTRESS_RADIUS: 200,
  PLAYABLE_AREA_RADIUS: 800,
  ENEMY_SPAWN_MIN_DISTANCE: 700,
  ENEMY_SPAWN_MAX_DISTANCE: 800,
  DEFAULT_TARGETING: TargetingPriority.CLOSEST_TO_CORE
};

export * from './characters/angel';
export * from './characters/lucy';
export * from './characters/tribu';
export * from './characters/kiu';
export * from './characters/gretch';
export * from './characters/cesar';
export * from './enemies';
export * from './levels';
export * from './pathfinding/DijkstraMap';

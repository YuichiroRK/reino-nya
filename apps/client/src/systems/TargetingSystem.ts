import Phaser from 'phaser';
import { TargetingPriority } from '@td-nya/shared';
import { Enemy } from '../entities/Enemy';
import { DijkstraMap } from '@td-nya/game-data';

export class TargetingSystem {
  static select(tower: { sprite: { x: number; y: number }; targetingPriority: TargetingPriority }, enemies: Enemy[], map: DijkstraMap) {
    switch (tower.targetingPriority) {
      case TargetingPriority.CLOSEST_TO_TOWER:
        return enemies.reduce((prev, curr) => this.distance(tower.sprite, curr) < this.distance(tower.sprite, prev) ? curr : prev);
      case TargetingPriority.HIGHEST_HP:
        return enemies.reduce((prev, curr) => curr.hp > prev.hp ? curr : prev);
      case TargetingPriority.LOWEST_HP:
        return enemies.reduce((prev, curr) => curr.hp < prev.hp ? curr : prev);
      case TargetingPriority.CLOSEST_TO_CORE:
      default:
        return enemies.reduce((prev, curr) => map.grid[curr.gridPos.y][curr.gridPos.x].distance < map.grid[prev.gridPos.y][prev.gridPos.x].distance ? curr : prev);
    }
  }

  private static distance(sprite: { x: number; y: number }, enemy: Enemy) {
    return Phaser.Math.Distance.Between(sprite.x, sprite.y, enemy.sprite.x, enemy.sprite.y);
  }
}

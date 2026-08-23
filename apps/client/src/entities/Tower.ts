import Phaser from 'phaser';
import { CharacterProfile, TargetingPriority } from '@td-nya/shared';
import { Enemy } from './Enemy';
import { DijkstraMap } from '@td-nya/game-data';

export class Tower {
  public profile: CharacterProfile;
  public sprite: Phaser.GameObjects.Rectangle;
  public rangeCircle: Phaser.GameObjects.Arc;
  public targetingPriority: TargetingPriority = TargetingPriority.CLOSEST_TO_CORE;
  
  private lastFiredTime: number = 0;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, profile: CharacterProfile, onClick: (t: Tower) => void) {
    this.scene = scene;
    this.profile = profile;

    // Draw range
    this.rangeCircle = scene.add.circle(
      x * tileSize + tileSize / 2,
      y * tileSize + tileSize / 2,
      profile.baseStats.range,
      0x4444ff,
      0.1
    ).setStrokeStyle(1, 0x4444ff, 0.5);

    // Draw tower body
    this.sprite = scene.add.rectangle(
      x * tileSize + tileSize / 2,
      y * tileSize + tileSize / 2,
      tileSize * 0.8,
      tileSize * 0.8,
      0x4444ff
    );

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => {
      // Draw selection ring temporarily
      this.sprite.setStrokeStyle(2, 0xffffff);
      scene.time.delayedCall(200, () => this.sprite.setStrokeStyle(0));
      onClick(this);
    });
  }

  update(time: number, enemies: Enemy[], map: DijkstraMap) {
    // Check if it can fire based on attack speed (attacks per second)
    const fireCooldownMs = 1000 / this.profile.baseStats.attackSpeed;
    if (time - this.lastFiredTime < fireCooldownMs) {
      return;
    }

    // Filter enemies in range
    const inRange = enemies.filter(e => {
      if (!e.isActive) return false;
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, e.sprite.x, e.sprite.y);
      return dist <= this.profile.baseStats.range;
    });

    if (inRange.length === 0) return;

    // Apply Targeting Priority
    const target = this.selectTarget(inRange, map);

    if (target) {
      this.fire(target);
      this.lastFiredTime = time;
    }
  }

  private selectTarget(enemies: Enemy[], map: DijkstraMap): Enemy {
    switch (this.targetingPriority) {
      case TargetingPriority.CLOSEST_TO_TOWER:
        return enemies.reduce((prev, curr) => {
          const distPrev = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, prev.sprite.x, prev.sprite.y);
          const distCurr = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, curr.sprite.x, curr.sprite.y);
          return distCurr < distPrev ? curr : prev;
        });

      case TargetingPriority.HIGHEST_HP:
        return enemies.reduce((prev, curr) => (curr.hp > prev.hp ? curr : prev));

      case TargetingPriority.LOWEST_HP:
        return enemies.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev));

      case TargetingPriority.CLOSEST_TO_CORE:
      default:
        // Use Dijkstra distance
        return enemies.reduce((prev, curr) => {
          const distPrev = map.grid[prev.gridPos.y][prev.gridPos.x].distance;
          const distCurr = map.grid[curr.gridPos.y][curr.gridPos.x].distance;
          return distCurr < distPrev ? curr : prev;
        });
    }
  }

  private fire(target: Enemy) {
    // Visual line
    const line = this.scene.add.line(
      0, 0,
      this.sprite.x, this.sprite.y,
      target.sprite.x, target.sprite.y,
      0xffff00, 1
    ).setOrigin(0);

    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 150,
      onComplete: () => line.destroy()
    });

    // Apply damage
    target.takeDamage(this.profile.baseStats.attack);
  }
}

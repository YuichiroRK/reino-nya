import Phaser from 'phaser';
import { CharacterProfile, TargetingPriority } from '@td-nya/shared';
import { Enemy } from './Enemy';
import { DijkstraMap } from '@td-nya/game-data';

export class Tower {
  public profile: CharacterProfile;
  public sprite: Phaser.GameObjects.Rectangle;
  public rangeGraphics: Phaser.GameObjects.Graphics;
  public targetingPriority: TargetingPriority = TargetingPriority.CLOSEST_TO_CORE;
  
  private lastFiredTime: number = 0;
  private scene: Phaser.Scene;
  private tileSize: number;
  public gridPos: { x: number; y: number };

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, profile: CharacterProfile, onClick: (t: Tower) => void) {
    this.scene = scene;
    this.profile = profile;
    this.gridPos = { x, y };
    this.tileSize = tileSize;

    // LoS-aware range overlay
    this.rangeGraphics = scene.add.graphics();

    // Draw tower body (on top of range overlay)
    this.sprite = scene.add.rectangle(
      x * tileSize + tileSize / 2,
      y * tileSize + tileSize / 2,
      tileSize * 0.8,
      tileSize * 0.8,
      0x4444ff
    );

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => {
      this.sprite.setStrokeStyle(2, 0xffffff);
      scene.time.delayedCall(200, () => this.sprite.setStrokeStyle(0));
      onClick(this);
    });
  }

  /**
   * Redraw the LoS-aware range polygon using raycasting.
   * Should be called after placement and after any wall changes.
   */
  drawRange(map: DijkstraMap) {
    this.rangeGraphics.clear();

    const cx = this.gridPos.x * this.tileSize + this.tileSize / 2;
    const cy = this.gridPos.y * this.tileSize + this.tileSize / 2;
    const maxRange = this.profile.baseStats.range;
    const RAY_COUNT = 120; // smoothness

    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      // Step along the ray in pixel increments
      let hit = maxRange; // assume open until wall found
      for (let dist = 0; dist <= maxRange; dist += this.tileSize * 0.5) {
        const px = cx + dx * dist;
        const py = cy + dy * dist;
        const gx = Math.floor(px / this.tileSize);
        const gy = Math.floor(py / this.tileSize);

        if (
          gy < 0 || gy >= map.grid.length ||
          gx < 0 || gx >= map.grid[0].length
        ) {
          hit = dist;
          break;
        }

        if (!map.grid[gy][gx].isWalkable) {
          // Stop just before the wall cell edge
          hit = Math.max(0, dist - this.tileSize * 0.5);
          break;
        }
      }

      points.push({
        x: cx + dx * hit,
        y: cy + dy * hit,
      });
    }

    // Filled LoS polygon
    this.rangeGraphics.fillStyle(0x4466ff, 0.12);
    this.rangeGraphics.beginPath();
    this.rangeGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.rangeGraphics.lineTo(points[i].x, points[i].y);
    }
    this.rangeGraphics.closePath();
    this.rangeGraphics.fillPath();

    // Outline
    this.rangeGraphics.lineStyle(1, 0x4466ff, 0.5);
    this.rangeGraphics.beginPath();
    this.rangeGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.rangeGraphics.lineTo(points[i].x, points[i].y);
    }
    this.rangeGraphics.closePath();
    this.rangeGraphics.strokePath();
  }

  update(time: number, enemies: Enemy[], map: DijkstraMap) {
    const fireCooldownMs = 1000 / this.profile.baseStats.attackSpeed;
    if (time - this.lastFiredTime < fireCooldownMs) return;

    const inRange = enemies.filter(e => {
      if (!e.isActive) return false;
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, e.sprite.x, e.sprite.y);
      if (dist > this.profile.baseStats.range) return false;
      return this.hasLineOfSight(this.gridPos.x, this.gridPos.y, e.gridPos.x, e.gridPos.y, map);
    });

    if (inRange.length === 0) return;

    const target = this.selectTarget(inRange, map);
    if (target) {
      this.fire(target);
      this.lastFiredTime = time;
    }
  }

  private hasLineOfSight(x0: number, y0: number, x1: number, y1: number, map: DijkstraMap): boolean {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (map.grid[y0] && map.grid[y0][x0] && !map.grid[y0][x0].isWalkable) return false;
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return true;
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
        return enemies.reduce((prev, curr) => {
          const distPrev = map.grid[prev.gridPos.y][prev.gridPos.x].distance;
          const distCurr = map.grid[curr.gridPos.y][curr.gridPos.x].distance;
          return distCurr < distPrev ? curr : prev;
        });
    }
  }

  private fire(target: Enemy) {
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

    target.takeDamage(this.profile.baseStats.attack);
  }
}

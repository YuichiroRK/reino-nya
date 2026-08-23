import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { VisualFX } from '../effects/VisualFX';

export class MiniMosasaur {
  public readonly sprite: Phaser.GameObjects.Arc;
  private lastAttack = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, large = false) {
    this.sprite = scene.add.circle(x, y, large ? 10 : 5, large ? 0x0288d1 : 0x29b6f6).setDepth(10);
  }

  update(time: number, enemies: Enemy[]) {
    const target = enemies.filter(enemy => enemy.isActive).sort((a, b) => Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, b.sprite.x, b.sprite.y))[0];
    if (!target) return;
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.sprite.x, target.sprite.y);
    if (distance > 160) {
      this.sprite.x += Math.sign(target.sprite.x - this.sprite.x) * 2;
      this.sprite.y += Math.sign(target.sprite.y - this.sprite.y) * 2;
    } else if (time - this.lastAttack >= 900) {
      target.takeDamage(25);
      VisualFX.impact(this.sprite.scene, target.sprite.x, target.sprite.y, 0x29b6f6);
      this.lastAttack = time;
    }
  }

  destroy() { this.sprite.destroy(); }
}

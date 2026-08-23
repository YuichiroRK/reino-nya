import Phaser from 'phaser';
import { HealthBar } from './HealthBar';

export class SacredGem {
  public readonly maxShield = 50;
  public readonly maxHp = 100;
  public shield = this.maxShield;
  public hp = this.maxHp;
  public isDestroyed = false;
  public readonly sprite: Phaser.GameObjects.Container;
  private readonly shieldBar: HealthBar;
  private readonly healthBar: HealthBar;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, index: number, origin = { x: 0, y: 0 }) {
    const px = origin.x + x * tileSize + tileSize / 2;
    const py = origin.y + y * tileSize + tileSize / 2;
    const crystal = scene.add.polygon(0, 0, [0, -12, 10, 0, 0, 12, -10, 0], 0x80deea);
    const label = scene.add.text(0, -24, `J${index + 1}`, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5);
    this.sprite = scene.add.container(px, py, [crystal, label]);
    this.shieldBar = new HealthBar(scene, 26);
    this.healthBar = new HealthBar(scene, 26);
    this.updateBars(px, py);
  }

  takeDamage(amount: number) {
    if (this.isDestroyed) return;
    let remaining = amount;
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, remaining);
      this.shield -= absorbed;
      remaining -= absorbed;
    }
    this.hp = Math.max(0, this.hp - remaining);
    this.updateBars(this.sprite.x, this.sprite.y);
    if (this.hp === 0) {
      this.isDestroyed = true;
      this.sprite.setAlpha(0.25);
    }
  }

  destroy() {
    this.shieldBar.destroy();
    this.healthBar.destroy();
    this.sprite.destroy();
  }

  private updateBars(x: number, y: number) {
    this.shieldBar.update(x, y - 21, this.shield, this.maxShield, 0x60a5fa);
    this.healthBar.update(x, y - 15, this.hp, this.maxHp, 0x4ade80);
  }
}

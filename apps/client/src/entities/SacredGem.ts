import Phaser from 'phaser';

export class SacredGem {
  public readonly maxShield = 50;
  public readonly maxHp = 100;
  public shield = this.maxShield;
  public hp = this.maxHp;
  public isDestroyed = false;
  public readonly sprite: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, index: number) {
    const px = x * tileSize + tileSize / 2;
    const py = y * tileSize + tileSize / 2;
    const crystal = scene.add.polygon(px, py, [0, -12, 10, 0, 0, 12, -10, 0], 0x80deea);
    const label = scene.add.text(px, py - 24, `J${index + 1}`, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5);
    this.sprite = scene.add.container(0, 0, [crystal, label]);
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
    if (this.hp === 0) {
      this.isDestroyed = true;
      this.sprite.setAlpha(0.25);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}

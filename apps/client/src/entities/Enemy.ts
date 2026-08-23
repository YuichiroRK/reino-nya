import Phaser from 'phaser';

export class Enemy {
  public sprite: Phaser.GameObjects.Rectangle;
  public gridPos: { x: number; y: number };
  public hp: number;
  public maxHp: number;
  public speed: number;
  public isActive: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number) {
    this.gridPos = { x, y };
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.speed = 1;
    this.isActive = true;

    this.sprite = scene.add.rectangle(
      x * tileSize + tileSize / 2,
      y * tileSize + tileSize / 2,
      tileSize * 0.6,
      tileSize * 0.6,
      0xff0000 // Rojo
    );
  }

  takeDamage(amount: number) {
    if (!this.isActive) return;
    
    this.hp -= amount;
    
    // Feedback visual (parpadeo blanco)
    const scene = this.sprite.scene;
    this.sprite.setFillStyle(0xffffff);
    scene.time.delayedCall(100, () => {
      if (this.isActive) {
        this.sprite.setFillStyle(0xff0000);
        // Bajar opacidad según vida
        this.sprite.setAlpha(Math.max(0.3, this.hp / this.maxHp));
      }
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isActive = false;
    this.sprite.destroy();
  }
}

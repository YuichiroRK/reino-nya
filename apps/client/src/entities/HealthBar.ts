import Phaser from 'phaser';

export class HealthBar {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly width: number;
  private readonly height = 4;

  constructor(scene: Phaser.Scene, width = 28) {
    this.graphics = scene.add.graphics().setDepth(12);
    this.width = width;
  }

  update(x: number, y: number, value: number, max: number, color: number) {
    const ratio = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
    this.graphics.clear();
    this.graphics.fillStyle(0x111111, 0.9).fillRect(x - this.width / 2, y, this.width, this.height);
    this.graphics.fillStyle(color, 1).fillRect(x - this.width / 2, y, this.width * ratio, this.height);
  }

  destroy() {
    this.graphics.destroy();
  }
}

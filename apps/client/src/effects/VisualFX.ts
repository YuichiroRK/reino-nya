import Phaser from 'phaser';

export class VisualFX {
  static floatText(scene: Phaser.Scene, x: number, y: number, text: string, color = '#ffffff') {
    const label = scene.add.text(x, y, text, {
      color,
      fontSize: '14px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    scene.tweens.add({
      targets: label,
      y: y - 28,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  static burstParticles(scene: Phaser.Scene, x: number, y: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = scene.add.circle(x, y, 3, color);
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 22,
        y: y + Math.sin(angle) * 22,
        alpha: 0,
        scale: 0.35,
        duration: 450,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }
}

import Phaser from 'phaser';
import { AudioFX } from '../effects/AudioFX';

export class Projectile {
  static fire(scene: Phaser.Scene, from: { x: number; y: number }, to: { x: number; y: number }, characterId: string, onHit: () => void) {
    const colors: Record<string, number> = { angel: 0xffd54f, tribu: 0x42a5f5, kiu: 0xff9800, gretch: 0xec407a, cesar: 0xffffff, lucy: 0x66bb6a };
    const sizes: Record<string, number> = { angel: 5, tribu: 4, kiu: 3, gretch: 7, cesar: 8, lucy: 5 };
    const projectile = scene.add.circle(from.x, from.y, sizes[characterId] ?? 4, colors[characterId] ?? 0xffffff).setDepth(11);
    AudioFX.tone(characterId === 'cesar' ? 120 : characterId === 'gretch' ? 520 : 320);
    scene.tweens.add({
      targets: projectile,
      x: to.x,
      y: to.y,
      duration: characterId === 'cesar' ? 280 : 160,
      ease: 'Linear',
      onComplete: () => { onHit(); projectile.destroy(); },
    });
  }
}

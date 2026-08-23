import Phaser from 'phaser';
import { GameConstants } from '@td-nya/game-data';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Assets will be loaded here
  }

  create() {
    const { width, height } = this.scale;
    
    // Draw the fortress center
    const center = this.add.circle(width / 2, height / 2, 40, 0x00ff00);
    
    // Draw fortress radius
    this.add.circle(width / 2, height / 2, GameConstants.FORTRESS_RADIUS, 0xffffff, 0.1)
      .setStrokeStyle(2, 0xffffff);

    // Initial text
    this.add.text(width / 2, 50, 'Imperio del Nya - Base Inicializada', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);

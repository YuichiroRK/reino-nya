import Phaser from 'phaser';
import { DijkstraMap } from '@td-nya/game-data';

class MainScene extends Phaser.Scene {
  private map!: DijkstraMap;
  private enemy!: Phaser.GameObjects.Rectangle;
  private enemyGridPos: { x: number; y: number } = { x: 0, y: 0 };
  private tileSize = 32;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    const cols = 20;
    const rows = 20;
    
    // 1. Inicializar Algoritmo Dijkstra (Flow Field)
    this.map = new DijkstraMap(cols, rows);

    // 2. Definir Centro (Joyas Sagradas)
    const centerX = 10;
    const centerY = 10;
    
    // 3. Crear Muralla (Obstáculo en forma de 'L')
    // Muralla vertical
    for (let y = 5; y <= 15; y++) {
      this.map.setWalkable(7, y, false);
    }
    // Muralla horizontal
    for (let x = 3; x <= 7; x++) {
      this.map.setWalkable(x, 15, false);
    }

    // 4. Calcular el mapa de calor hacia el centro
    this.map.calculate([{ x: centerX, y: centerY }]);

    // 5. Dibujar el grid visualmente
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const node = this.map.grid[y][x];
        
        let color = 0x222222; // Casilla vacía
        if (!node.isWalkable) color = 0x888888; // Muralla (Gris)
        else if (x === centerX && y === centerY) color = 0x00ff00; // Joyas (Verde)

        // Dibujar Casilla
        const rect = this.add.rectangle(
          x * this.tileSize + this.tileSize / 2, 
          y * this.tileSize + this.tileSize / 2, 
          this.tileSize - 2, 
          this.tileSize - 2, 
          color
        );

        // Opcional: Escribir la distancia en la casilla para debugging visual
        if (node.isWalkable && (x !== centerX || y !== centerY) && node.distance < 1000) {
          this.add.text(
            x * this.tileSize + this.tileSize / 2, 
            y * this.tileSize + this.tileSize / 2, 
            node.distance.toString(), 
            { fontSize: '10px', color: '#aaaaaa' }
          ).setOrigin(0.5);
        }
      }
    }

    // 6. Crear el enemigo en la esquina superior izquierda
    this.enemyGridPos = { x: 0, y: 0 };
    this.enemy = this.add.rectangle(
      this.enemyGridPos.x * this.tileSize + this.tileSize / 2,
      this.enemyGridPos.y * this.tileSize + this.tileSize / 2,
      this.tileSize * 0.6,
      this.tileSize * 0.6,
      0xff0000 // Enemigo (Rojo)
    );

    // 7. Loop de movimiento (cada 0.4s el enemigo da un paso)
    this.time.addEvent({
      delay: 400,
      callback: this.moveEnemy,
      callbackScope: this,
      loop: true
    });

    // Texto de interfaz
    this.add.text(10, rows * this.tileSize + 10, 'Prueba Visual: Dijkstra Flow Field', { fontSize: '20px', color: '#ffffff' });
  }

  moveEnemy() {
    // Verificar si ya llegó al centro
    if (this.enemyGridPos.x === 10 && this.enemyGridPos.y === 10) return;

    // Pedirle al algoritmo el siguiente paso
    const nextNode = this.map.getNextStep(this.enemyGridPos.x, this.enemyGridPos.y);

    if (nextNode) {
      this.enemyGridPos.x = nextNode.x;
      this.enemyGridPos.y = nextNode.y;

      // Animar movimiento visualmente en Phaser
      this.tweens.add({
        targets: this.enemy,
        x: this.enemyGridPos.x * this.tileSize + this.tileSize / 2,
        y: this.enemyGridPos.y * this.tileSize + this.tileSize / 2,
        duration: 200,
        ease: 'Linear'
      });
    }
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

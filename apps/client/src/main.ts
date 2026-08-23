import Phaser from 'phaser';
import { DijkstraMap } from '@td-nya/game-data';

class MainScene extends Phaser.Scene {
  private map!: DijkstraMap;
  private enemies: { sprite: Phaser.GameObjects.Rectangle; gridPos: { x: number; y: number } }[] = [];
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

    // 6. Escuchar clicks para spawnear enemigos
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const x = Math.floor(pointer.x / this.tileSize);
      const y = Math.floor(pointer.y / this.tileSize);

      // Solo spawnear si es una casilla válida y no es una muralla
      if (x >= 0 && x < cols && y >= 0 && y < rows && this.map.grid[y][x].isWalkable) {
        this.spawnEnemy(x, y);
      }
    });

    // 7. Loop de movimiento (cada 0.4s el enemigo da un paso)
    this.time.addEvent({
      delay: 400,
      callback: this.moveEnemies,
      callbackScope: this,
      loop: true
    });

    // Texto de interfaz
    this.add.text(10, rows * this.tileSize + 10, 'Prueba Visual: Haz click en el mapa para crear enemigos', { fontSize: '20px', color: '#ffffff' });
  }

  spawnEnemy(x: number, y: number) {
    const sprite = this.add.rectangle(
      x * this.tileSize + this.tileSize / 2,
      y * this.tileSize + this.tileSize / 2,
      this.tileSize * 0.6,
      this.tileSize * 0.6,
      0xff0000 // Enemigo (Rojo)
    );
    this.enemies.push({ sprite, gridPos: { x, y } });
  }

  moveEnemies() {
    for (const enemyData of this.enemies) {
      // Verificar si ya llegó al centro
      if (enemyData.gridPos.x === 10 && enemyData.gridPos.y === 10) continue;

      // Pedirle al algoritmo el siguiente paso
      const nextNode = this.map.getNextStep(enemyData.gridPos.x, enemyData.gridPos.y);

      if (nextNode) {
        enemyData.gridPos.x = nextNode.x;
        enemyData.gridPos.y = nextNode.y;

        // Animar movimiento visualmente en Phaser
        this.tweens.add({
          targets: enemyData.sprite,
          x: enemyData.gridPos.x * this.tileSize + this.tileSize / 2,
          y: enemyData.gridPos.y * this.tileSize + this.tileSize / 2,
          duration: 200,
          ease: 'Linear'
        });
      }
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

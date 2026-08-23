import Phaser from 'phaser';
import { DijkstraMap, Angel } from '@td-nya/game-data';
import { Enemy } from './entities/Enemy';
import { Tower } from './entities/Tower';
import { TargetingPriority } from '@td-nya/shared';

class MainScene extends Phaser.Scene {
  private map!: DijkstraMap;
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private tileSize = 32;
  
  // Referencias a la UI HTML
  private selectedTower: Tower | null = null;
  private uiPanel!: HTMLElement;
  private uiTowerName!: HTMLElement;
  private uiTowerRole!: HTMLElement;
  private uiTargetingSelect!: HTMLSelectElement;
  private uiCloseBtn!: HTMLButtonElement;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    const cols = 20;
    const rows = 20;
    
    this.map = new DijkstraMap(cols, rows);
    const centerX = 10;
    const centerY = 10;
    
    // Muralla L
    for (let y = 5; y <= 15; y++) this.map.setWalkable(7, y, false);
    for (let x = 3; x <= 7; x++) this.map.setWalkable(x, 15, false);

    this.map.calculate([{ x: centerX, y: centerY }]);

    // Dibujar grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const node = this.map.grid[y][x];
        let color = 0x222222;
        if (!node.isWalkable) color = 0x888888;
        else if (x === centerX && y === centerY) color = 0x00ff00;

        this.add.rectangle(
          x * this.tileSize + this.tileSize / 2, 
          y * this.tileSize + this.tileSize / 2, 
          this.tileSize - 2, 
          this.tileSize - 2, 
          color
        );
      }
    }

    // Prevenir el menú contextual del navegador en click derecho
    this.input.mouse!.disableContextMenu();

    // Controles (Click Izq = Enemigo, Click Der = Torre)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignorar clicks si ocurrieron sobre el panel HTML
      if (pointer.event.target instanceof HTMLElement && pointer.event.target.tagName !== 'CANVAS') {
        return;
      }

      const x = Math.floor(pointer.x / this.tileSize);
      const y = Math.floor(pointer.y / this.tileSize);

      if (x >= 0 && x < cols && y >= 0 && y < rows && this.map.grid[y][x].isWalkable) {
        if (pointer.rightButtonDown()) {
          // Spawnear Torre (Angel como prototipo)
          const tower = new Tower(this, x, y, this.tileSize, Angel, (t) => this.openUIPanel(t));
          this.towers.push(tower);
        } else {
          // Spawnear Enemigo
          const enemy = new Enemy(this, x, y, this.tileSize);
          this.enemies.push(enemy);
        }
      } else {
        // Cerrar panel si se hace click en un lugar inválido (ej. muro)
        this.closeUIPanel();
      }
    });

    this.time.addEvent({
      delay: 400,
      callback: this.moveEnemies,
      callbackScope: this,
      loop: true
    });

    this.add.text(10, rows * this.tileSize + 10, 'Prueba Visual de Combate', { fontSize: '20px', color: '#ffffff' });
    this.add.text(10, rows * this.tileSize + 35, 'Click Izq: Spawnear Enemigo | Click Der: Spawnear Torre (Angel)', { fontSize: '14px', color: '#aaaaaa' });

    this.setupHTMLUI();
  }

  update(time: number, delta: number) {
    // Ciclo de combate
    for (const tower of this.towers) {
      tower.update(time, this.enemies, this.map);
    }
  }

  setupHTMLUI() {
    this.uiPanel = document.getElementById('ui-panel')!;
    this.uiTowerName = document.getElementById('tower-name')!;
    this.uiTowerRole = document.getElementById('tower-role')!;
    this.uiTargetingSelect = document.getElementById('targeting-select') as HTMLSelectElement;
    this.uiCloseBtn = document.getElementById('close-panel') as HTMLButtonElement;

    this.uiCloseBtn.addEventListener('click', () => this.closeUIPanel());

    this.uiTargetingSelect.addEventListener('change', (e) => {
      if (this.selectedTower) {
        const val = (e.target as HTMLSelectElement).value;
        this.selectedTower.targetingPriority = val as TargetingPriority;
      }
    });
  }

  openUIPanel(tower: Tower) {
    this.selectedTower = tower;
    this.uiTowerName.innerText = tower.profile.name + ' - ' + tower.profile.title;
    this.uiTowerRole.innerText = 'Rol: ' + tower.profile.roles.join(', ') + ' | Daño: ' + tower.profile.baseStats.attack;
    
    // Sincronizar el select
    this.uiTargetingSelect.value = tower.targetingPriority;
    
    this.uiPanel.classList.add('active');
  }

  closeUIPanel() {
    this.selectedTower = null;
    this.uiPanel.classList.remove('active');
  }

  moveEnemies() {
    // Limpiar enemigos muertos
    this.enemies = this.enemies.filter(e => e.isActive);

    for (const enemy of this.enemies) {
      if (enemy.gridPos.x === 10 && enemy.gridPos.y === 10) continue;

      const nextNode = this.map.getNextStep(enemy.gridPos.x, enemy.gridPos.y);

      if (nextNode) {
        enemy.gridPos.x = nextNode.x;
        enemy.gridPos.y = nextNode.y;

        this.tweens.add({
          targets: enemy.sprite,
          x: enemy.gridPos.x * this.tileSize + this.tileSize / 2,
          y: enemy.gridPos.y * this.tileSize + this.tileSize / 2,
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

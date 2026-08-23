import Phaser from 'phaser';
import { DijkstraMap, Angel, Lucy, Tribu, Kiu, Gretch, Cesar } from '@td-nya/game-data';
import { Enemy } from './entities/Enemy';
import { Tower } from './entities/Tower';
import { CharacterProfile, TargetingPriority } from '@td-nya/shared';

const CHARACTER_MAP: Record<string, CharacterProfile> = {
  angel: Angel,
  lucy: Lucy,
  tribu: Tribu,
  kiu: Kiu,
  gretch: Gretch,
  cesar: Cesar,
};

class MainScene extends Phaser.Scene {
  private map!: DijkstraMap;
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private gridRects: Phaser.GameObjects.Rectangle[][] = [];
  private tileSize = 32;
  private activeTool: 'tower' | 'wall' = 'tower';
  private selectedCharacter: CharacterProfile = Angel;
  
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

    // Dibujar grid interactivo
    for (let y = 0; y < rows; y++) {
      this.gridRects[y] = [];
      for (let x = 0; x < cols; x++) {
        const node = this.map.grid[y][x];
        let color = 0x222222;
        if (!node.isWalkable) color = 0x888888;
        else if (x === centerX && y === centerY) color = 0x00ff00;

        const rect = this.add.rectangle(
          x * this.tileSize + this.tileSize / 2, 
          y * this.tileSize + this.tileSize / 2, 
          this.tileSize - 2, 
          this.tileSize - 2, 
          color
        );
        this.gridRects[y][x] = rect;
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

      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (pointer.rightButtonDown()) {
          // Usar Herramienta Activa
          if (this.activeTool === 'tower') {
            if (this.map.grid[y][x].isWalkable && !(x === 10 && y === 10)) {
              const tower = new Tower(this, x, y, this.tileSize, this.selectedCharacter, (t) => this.openUIPanel(t));
              this.towers.push(tower);
            }
          } else if (this.activeTool === 'wall') {
            if (!(x === 10 && y === 10)) {
              this.toggleWall(x, y);
            }
          }
        } else {
          // Click Izquierdo: Solo spawnear si es caminable
          if (this.map.grid[y][x].isWalkable) {
            const enemy = new Enemy(this, x, y, this.tileSize);
            this.enemies.push(enemy);
          } else {
            this.closeUIPanel();
          }
        }
      } else {
        this.closeUIPanel();
      }
    });

    this.time.addEvent({
      delay: 400,
      callback: this.moveEnemies,
      callbackScope: this,
      loop: true
    });

    this.add.text(10, rows * this.tileSize + 10, 'Prueba Visual de Combate y Muros', { fontSize: '20px', color: '#ffffff' });
    this.add.text(10, rows * this.tileSize + 35, 'Click Izq: Crear Enemigo | Click Der: Usar Herramienta', { fontSize: '14px', color: '#aaaaaa' });

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

    // Toolbar logic
    const toolBtns = document.querySelectorAll('.tool-btn');
    const charSelectWrapper = document.getElementById('char-select-wrapper')!;
    const charSelect = document.getElementById('char-select') as HTMLSelectElement;

    toolBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        toolBtns.forEach(b => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.activeTool = target.dataset.tool as 'tower' | 'wall';

        // Mostrar/ocultar selector de personaje
        if (this.activeTool === 'tower') {
          charSelectWrapper.classList.add('visible');
        } else {
          charSelectWrapper.classList.remove('visible');
        }
      });
    });

    charSelect.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      this.selectedCharacter = CHARACTER_MAP[val] ?? Angel;
    });
  }

  toggleWall(x: number, y: number) {
    const node = this.map.grid[y][x];
    const isNowWalkable = !node.isWalkable;
    
    this.map.setWalkable(x, y, isNowWalkable);
    
    // Recalcular mapa
    this.map.calculate([{ x: 10, y: 10 }]);
    
    // Actualizar visual
    this.gridRects[y][x].setFillStyle(isNowWalkable ? 0x222222 : 0x888888);
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

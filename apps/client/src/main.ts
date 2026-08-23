import Phaser from 'phaser';
import { DijkstraMap, Angel, Lucy, Tribu, Kiu, Gretch, Cesar } from '@td-nya/game-data';
import { Enemy } from './entities/Enemy';
import { Tower } from './entities/Tower';
import { SacredGem } from './entities/SacredGem';
import { WaveSystem } from './systems/WaveSystem';
import { CharacterProfile, Rarity, TargetingPriority } from '@td-nya/shared';

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
  private occupiedCells = new Set<string>(); // Fix #2: prevent tower stacking
  private gems: SacredGem[] = [];
  private waveSystem = new WaveSystem();
  private gameState: 'playing' | 'victory' | 'defeat' = 'playing';
  
  // Referencias a la UI HTML
  private selectedTower: Tower | null = null;
  private uiPanel!: HTMLElement;
  private uiTowerName!: HTMLElement;
  private uiTowerRole!: HTMLElement;
  private uiTargetingSelect!: HTMLSelectElement;
  private uiCloseBtn!: HTMLButtonElement;
  private uiRemoveBtn!: HTMLButtonElement;
  private uiTowerLimit!: HTMLElement;
  private uiWaveStatus!: HTMLElement;
  private uiGemStatus!: HTMLElement;

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

    this.gems = [
      new SacredGem(this, 9, 10, this.tileSize, 0),
      new SacredGem(this, 11, 10, this.tileSize, 1),
      new SacredGem(this, 10, 11, this.tileSize, 2),
    ];

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
            const cellKey = `${x},${y}`;
            // Fix #2: block if occupied by another tower
            if (this.map.grid[y][x].isWalkable && !(x === 10 && y === 10) && !this.occupiedCells.has(cellKey) && this.canPlaceCharacter(this.selectedCharacter)) {
              const tower = new Tower(this, x, y, this.tileSize, this.selectedCharacter, (t) => this.openUIPanel(t));
              // Fix #3: draw LoS range immediately
              tower.drawRange(this.map);
              this.towers.push(tower);
              this.occupiedCells.add(cellKey);
              this.updateTowerLimit();
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
    if (this.gameState !== 'playing') return;
    this.waveSystem.update(time, this.enemies.filter(enemy => enemy.isActive).length, (wave, count) => this.spawnWave(wave, count));
    // Ciclo de combate
    for (const tower of this.towers) {
      tower.update(time, this.enemies, this.map, this.towers);
    }
    this.updateGameStatus();
    if (this.gems.every(gem => gem.isDestroyed)) this.endGame('defeat');
    else if (this.waveSystem.wave >= this.waveSystem.maxWaves && this.enemies.every(enemy => !enemy.isActive)) this.endGame('victory');
  }

  setupHTMLUI() {
    this.uiPanel = document.getElementById('ui-panel')!;
    this.uiTowerName = document.getElementById('tower-name')!;
    this.uiTowerRole = document.getElementById('tower-role')!;
    this.uiTargetingSelect = document.getElementById('targeting-select') as HTMLSelectElement;
    this.uiCloseBtn = document.getElementById('close-panel') as HTMLButtonElement;
    this.uiRemoveBtn = document.getElementById('remove-tower') as HTMLButtonElement;
    this.uiTowerLimit = document.getElementById('tower-limit')!;
    this.uiWaveStatus = document.getElementById('wave-status')!;
    this.uiGemStatus = document.getElementById('gem-status')!;

    this.uiCloseBtn.addEventListener('click', () => this.closeUIPanel());
    this.uiRemoveBtn.addEventListener('click', () => this.removeSelectedTower());
    this.updateTowerLimit();

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
      this.updateTowerLimit();
    });
  }

  toggleWall(x: number, y: number) {
    const node = this.map.grid[y][x];
    const isNowWalkable = !node.isWalkable;
    
    this.map.setWalkable(x, y, isNowWalkable);
    this.map.calculate([{ x: 10, y: 10 }]);
    
    // Update grid visual
    this.gridRects[y][x].setFillStyle(isNowWalkable ? 0x222222 : 0x888888);

    // Fix #3: Redraw all tower ranges since walls changed
    for (const tower of this.towers) {
      tower.drawRange(this.map);
    }
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

  private getTowerLimit(rarity: Rarity) {
    if (rarity === Rarity.SSR) return 1;
    if (rarity === Rarity.SR) return 2;
    return 3;
  }

  private canPlaceCharacter(profile: CharacterProfile) {
    const current = this.towers.filter(tower => tower.profile.id === profile.id).length;
    if (current >= this.getTowerLimit(profile.rarity)) {
      this.uiTowerLimit.innerText = `Límite alcanzado para ${profile.name}`;
      return false;
    }
    return true;
  }

  private updateTowerLimit() {
    if (!this.uiTowerLimit) return;
    const current = this.towers.filter(tower => tower.profile.id === this.selectedCharacter.id).length;
    this.uiTowerLimit.innerText = `${this.selectedCharacter.name}: ${current}/${this.getTowerLimit(this.selectedCharacter.rarity)}`;
  }

  private removeSelectedTower() {
    if (!this.selectedTower) return;
    const tower = this.selectedTower;
    const cellKey = `${tower.gridPos.x},${tower.gridPos.y}`;
    tower.destroy();
    this.towers = this.towers.filter(item => item !== tower);
    this.occupiedCells.delete(cellKey);
    this.closeUIPanel();
    this.updateTowerLimit();
  }

  private spawnWave(wave: number, count: number) {
    const spawnPoints = [{ x: 0, y: 0 }, { x: 19, y: 0 }, { x: 0, y: 19 }, { x: 19, y: 19 }, { x: 10, y: 0 }, { x: 19, y: 10 }, { x: 0, y: 10 }];
    for (let index = 0; index < count; index++) {
      const point = spawnPoints[index % spawnPoints.length];
      const enemy = new Enemy(this, point.x, point.y, this.tileSize);
      enemy.maxHp = 100 + wave * 30;
      enemy.hp = enemy.maxHp;
      enemy.attackDamage = 10 + wave * 2;
      this.enemies.push(enemy);
    }
  }

  private updateGameStatus() {
    const aliveGems = this.gems.filter(gem => !gem.isDestroyed).length;
    this.uiWaveStatus.innerText = `Oleada: ${this.waveSystem.wave}/${this.waveSystem.maxWaves}`;
    this.uiGemStatus.innerText = `Joyas: ${aliveGems}/3`;
  }

  private endGame(state: 'victory' | 'defeat') {
    this.gameState = state;
    const message = state === 'victory' ? '¡VICTORIA! Todas las oleadas superadas' : 'DERROTA: Las tres joyas fueron destruidas';
    this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontSize: '26px', color: state === 'victory' ? '#a5d6a7' : '#ef9a9a',
      backgroundColor: '#121212', padding: { x: 18, y: 12 },
    }).setOrigin(0.5).setDepth(20);
  }

  moveEnemies() {
    // Limpiar enemigos muertos
    this.enemies = this.enemies.filter(e => e.isActive);

    for (const enemy of this.enemies) {
      if (enemy.gridPos.x === 10 && enemy.gridPos.y === 10) {
        const gem = this.gems.find(candidate => !candidate.isDestroyed);
        if (gem) enemy.attackGem(gem, this.time.now);
        continue;
      }

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

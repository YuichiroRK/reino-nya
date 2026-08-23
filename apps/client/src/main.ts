import Phaser from 'phaser';
import { DijkstraMap, Angel, Lucy, Tribu, Kiu, Gretch, Cesar, EnemyData, Waves } from '@td-nya/game-data';
import { Enemy } from './entities/Enemy';
import { Tower } from './entities/Tower';
import { SacredGem } from './entities/SacredGem';
import { WaveSystem } from './systems/WaveSystem';
import { CharacterProfile, Rarity, TargetingPriority, WaveDefinition } from '@td-nya/shared';

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
  private isPaused = false;
  private coins = 500;
  private rewardedWave = 0;
  
  // Referencias a la UI HTML
  private selectedTower: Tower | null = null;
  private uiPanel!: HTMLElement;
  private uiTowerName!: HTMLElement;
  private uiTowerRole!: HTMLElement;
  private uiTargetingSelect!: HTMLSelectElement;
  private uiCloseBtn!: HTMLButtonElement;
  private uiRemoveBtn!: HTMLButtonElement;
  private uiTowerLimit!: HTMLElement;
  private uiTowerPrice!: HTMLElement;
  private uiWaveStatus!: HTMLElement;
  private uiGemStatus!: HTMLElement;
  private uiWaveProgress!: HTMLElement;
  private uiGemProgress!: HTMLElement;
  private uiEnemyStatus!: HTMLElement;
  private uiGameState!: HTMLElement;
  private uiHud!: HTMLElement;
  private uiHudToggle!: HTMLButtonElement;
  private uiWaveButton!: HTMLButtonElement;
  private uiCoins!: HTMLElement;
  private uiSkills!: HTMLElement;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    const cols = 20;
    const rows = 20;
    this.tileSize = Math.min(40, Math.floor((this.scale.width - 16) / cols));
    
    this.map = new DijkstraMap(cols, rows);
    const centerX = 10;
    const centerY = 10;
    
    this.generateRandomObstacles(cols, rows, centerX, centerY);

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
            if (!(x === 10 && y === 10) && !this.occupiedCells.has(cellKey) && this.canPlaceCharacter(this.selectedCharacter) && this.coins >= this.getTowerCost(this.selectedCharacter)) {
              const tower = new Tower(this, x, y, this.tileSize, this.selectedCharacter, (t) => this.openUIPanel(t));
              // Fix #3: draw LoS range immediately
              tower.drawRange(this.map);
              this.towers.push(tower);
              this.occupiedCells.add(cellKey);
              this.coins -= this.getTowerCost(this.selectedCharacter);
              this.updateTowerLimit();
              this.updateEconomyUI();
            }
          } else if (this.activeTool === 'wall') {
            if (!(x === 10 && y === 10)) {
              this.toggleWall(x, y);
            }
          }
        } else {
          // Click Izquierdo: Solo spawnear si es caminable
          if (this.map.grid[y][x].isWalkable) {
            const enemy = new Enemy(this, x, y, this.tileSize, EnemyData.basic);
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
      delay: 250,
      callback: this.moveEnemies,
      callbackScope: this,
      loop: true
    });

    this.add.text(10, rows * this.tileSize + 10, 'Prueba Visual de Combate y Muros', { fontSize: '20px', color: '#ffffff' });
    this.add.text(10, rows * this.tileSize + 35, 'Click Izq: Crear Enemigo | Click Der: Usar Herramienta', { fontSize: '14px', color: '#aaaaaa' });

    this.setupHTMLUI();
  }

  update(time: number, delta: number) {
    if (this.gameState !== 'playing' || this.isPaused) return;
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive).length;
    if (this.waveSystem.wave > this.rewardedWave && activeEnemies === 0) {
      this.coins += this.waveSystem.wave * 25;
      this.rewardedWave = this.waveSystem.wave;
    }
    this.waveSystem.update(time, activeEnemies, Waves, wave => this.spawnWave(wave));
    // Ciclo de combate
    for (const tower of this.towers) {
      tower.update(time, this.enemies, this.map, this.towers);
    }
    this.updateGameStatus();
    this.updateEconomyUI();
    if (this.selectedTower) this.updateSkillUI(this.selectedTower);
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
    this.uiTowerPrice = document.getElementById('tower-price')!;
    this.uiWaveStatus = document.getElementById('wave-status')!;
    this.uiGemStatus = document.getElementById('gem-status')!;
    this.uiWaveProgress = document.getElementById('wave-progress')!;
    this.uiGemProgress = document.getElementById('gem-progress')!;
    this.uiEnemyStatus = document.getElementById('enemy-status')!;
    this.uiGameState = document.getElementById('game-state')!;
    this.uiHud = document.getElementById('game-status')!;
    this.uiHudToggle = document.getElementById('hud-toggle') as HTMLButtonElement;
    this.uiWaveButton = document.getElementById('wave-button') as HTMLButtonElement;
    this.uiCoins = document.getElementById('coin-status')!;
    this.uiSkills = document.getElementById('skill-status')!;

    this.uiCloseBtn.addEventListener('click', () => this.closeUIPanel());
    this.uiRemoveBtn.addEventListener('click', () => this.removeSelectedTower());
    this.uiWaveButton.addEventListener('click', () => {
      if (this.isPaused) {
        this.isPaused = false;
        this.scene.resume();
      } else {
        this.isPaused = true;
        this.scene.pause();
      }
      this.uiWaveButton.innerText = this.isPaused ? 'Continuar' : 'Pausar';
      this.uiGameState.innerText = this.isPaused ? 'PAUSADO' : 'EN JUEGO';
      this.uiGameState.style.color = this.isPaused ? '#fcd34d' : '#a7f3d0';
    });
    this.uiHudToggle.addEventListener('click', () => {
      const collapsed = this.uiHud.classList.toggle('collapsed');
      this.uiHudToggle.innerText = collapsed ? 'Mostrar' : 'Ocultar';
    });
    this.updateTowerLimit();
    this.updateEconomyUI();

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
    this.uiTowerRole.innerText = 'Rol: ' + tower.profile.roles.join(', ') + ' | Daño: ' + tower.profile.baseStats.attack + ' | Vida: ' + tower.hp + '/' + tower.maxHp;
    
    // Sincronizar el select
    this.uiTargetingSelect.value = tower.targetingPriority;
    this.updateSkillUI(tower);
    
    this.uiPanel.classList.add('active');
  }

  private updateSkillUI(tower: Tower) {
    this.uiSkills.innerHTML = tower.getSkillStatuses(this.time.now).map(skill => {
      if (skill.type === 'passive') return `<div class="skill-card passive"><span>${skill.name}</span><span class="skill-state">PASIVA</span></div>`;
      const status = skill.remainingMs > 0 ? `${(skill.remainingMs / 1000).toFixed(1)}s` : 'Lista';
      const stateClass = skill.remainingMs > 0 ? 'cooldown' : 'ready';
      return `<div class="skill-card ${stateClass}"><span>${skill.name}</span><span class="skill-state">${skill.active ? 'ACTIVA' : status}</span></div>`;
    }).join('');
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
    if (this.coins < this.getTowerCost(profile)) {
      this.uiTowerLimit.innerText = `Necesitas ${this.getTowerCost(profile)} monedas`;
      return false;
    }
    return true;
  }

  private getTowerCost(profile: CharacterProfile) {
    if (profile.rarity === Rarity.SSR) return 250;
    if (profile.rarity === Rarity.SR) return 150;
    return 75;
  }

  private updateEconomyUI() {
    if (this.uiCoins) this.uiCoins.innerText = `Monedas: ${this.coins}`;
  }

  private updateTowerLimit() {
    if (!this.uiTowerLimit) return;
    const current = this.towers.filter(tower => tower.profile.id === this.selectedCharacter.id).length;
    this.uiTowerLimit.innerText = `${this.selectedCharacter.name}: ${current}/${this.getTowerLimit(this.selectedCharacter.rarity)}`;
    this.uiTowerPrice.innerText = `Coste: ${this.getTowerCost(this.selectedCharacter)} monedas`;
  }

  private removeSelectedTower() {
    if (!this.selectedTower) return;
    const tower = this.selectedTower;
    const cellKey = `${tower.gridPos.x},${tower.gridPos.y}`;
    tower.destroy();
    this.towers = this.towers.filter(item => item !== tower);
    this.occupiedCells.delete(cellKey);
    this.coins += Math.floor(this.getTowerCost(tower.profile) * 0.5);
    this.closeUIPanel();
    this.updateTowerLimit();
    this.updateEconomyUI();
  }

  private spawnWave(wave: WaveDefinition) {
    const spawnPoints = [{ x: 0, y: 0 }, { x: 19, y: 0 }, { x: 0, y: 19 }, { x: 19, y: 19 }, { x: 10, y: 0 }, { x: 19, y: 10 }, { x: 0, y: 10 }];
    let spawnIndex = 0;
    for (const entry of wave.entries) {
      const profile = EnemyData[entry.enemyId] ?? EnemyData.basic;
      for (let count = 0; count < entry.count; count++) {
        const point = spawnPoints[spawnIndex++ % spawnPoints.length];
        this.enemies.push(new Enemy(this, point.x, point.y, this.tileSize, profile, spawnIndex % this.gems.length, 1 + wave.number * 0.08, reward => {
          this.coins += reward;
        }));
      }
    }
  }

  private updateGameStatus() {
    const aliveGems = this.gems.filter(gem => !gem.isDestroyed).length;
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive).length;
    this.uiWaveStatus.innerText = `Oleada: ${this.waveSystem.wave}/${this.waveSystem.maxWaves}`;
    this.uiGemStatus.innerText = `Joyas: ${aliveGems}/3`;
    this.uiEnemyStatus.innerText = `${activeEnemies}`;
    this.uiWaveProgress.style.width = `${(this.waveSystem.wave / this.waveSystem.maxWaves) * 100}%`;
    this.uiGemProgress.style.width = `${(aliveGems / this.gems.length) * 100}%`;
  }

  private endGame(state: 'victory' | 'defeat') {
    this.gameState = state;
    this.uiGameState.innerText = state === 'victory' ? 'VICTORIA' : 'DERROTA';
    this.uiGameState.style.color = state === 'victory' ? '#86efac' : '#fca5a5';
    this.uiWaveButton.disabled = true;
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
        const assignedGem = this.gems[enemy.targetGemIndex];
        const gem = assignedGem && !assignedGem.isDestroyed
          ? assignedGem
          : this.gems.find(candidate => !candidate.isDestroyed);
        if (gem) enemy.attackGem(gem, this.time.now);
        continue;
      }

      const nextNode = enemy.profile.movement === 'flying'
        ? this.getDirectStep(enemy.gridPos.x, enemy.gridPos.y)
        : this.map.getNextStep(enemy.gridPos.x, enemy.gridPos.y);

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

  private getDirectStep(x: number, y: number) {
    return { x: x + Math.sign(10 - x), y: y + Math.sign(10 - y) };
  }

  private generateRandomObstacles(cols: number, rows: number, centerX: number, centerY: number) {
    const spawnPoints = [{ x: 0, y: 0 }, { x: 19, y: 0 }, { x: 0, y: 19 }, { x: 19, y: 19 }, { x: 10, y: 0 }, { x: 19, y: 10 }, { x: 0, y: 10 }];
    let placed = 0;
    let attempts = 0;
    while (placed < 24 && attempts++ < 150) {
      const x = 2 + Math.floor(Math.random() * (cols - 4));
      const y = 2 + Math.floor(Math.random() * (rows - 4));
      if (Math.abs(x - centerX) <= 2 && Math.abs(y - centerY) <= 2) continue;
      if (!this.map.grid[y][x].isWalkable) continue;

      this.map.setWalkable(x, y, false);
      this.map.calculate([{ x: centerX, y: centerY }]);
      const keepsSpawnsReachable = spawnPoints.every(point => this.map.grid[point.y][point.x].distance < Number.MAX_VALUE);
      if (keepsSpawnsReachable) placed++;
      else this.map.setWalkable(x, y, true);
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

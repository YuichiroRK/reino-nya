import Phaser from 'phaser';
import { DijkstraMap, Angel, Lucy, Tribu, Kiu, Gretch, Cesar, EnemyData, Levels } from '@td-nya/game-data';
import { Enemy } from './entities/Enemy';
import { Tower } from './entities/Tower';
import { SacredGem } from './entities/SacredGem';
import { WaveSystem } from './systems/WaveSystem';
import { VisualFX } from './effects/VisualFX';
import { ProgressionSystem } from './systems/ProgressionSystem';
import { CharacterProfile, Rarity, SkillTargetPriority, TargetingPriority } from '@td-nya/shared';

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
  private difficultyMultiplier = 1;
  private spawnIndex = 0;
  private selectedEnemyId = 'basic';
  private selectedLevel = Levels.level1;
  private progression = new ProgressionSystem();
  private doorCells = new Set<string>();
  
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
  private uiDifficulty!: HTMLSelectElement;
  private uiWaveDuration!: HTMLSelectElement;
  private uiLevel!: HTMLSelectElement;
  private uiEndScreen!: HTMLElement;
  private uiEndTitle!: HTMLElement;
  private uiEndMessage!: HTMLElement;
  private uiRestartButton!: HTMLButtonElement;
  private uiHud!: HTMLElement;
  private uiHudToggle!: HTMLButtonElement;
  private uiWaveButton!: HTMLButtonElement;
  private uiCoins!: HTMLElement;
  private uiSkills!: HTMLElement;
  private uiSkillInfo!: HTMLElement;
  private uiSkillModal!: HTMLElement;
  private uiSkillDetailTitle!: HTMLElement;
  private uiSkillDetailType!: HTMLElement;
  private uiSkillDetailDescription!: HTMLElement;
  private uiSkillDetailEffects!: HTMLElement;
  private uiSkillDetailCooldown!: HTMLElement;
  private uiCloseSkillDetail!: HTMLButtonElement;
  private uiSkillTarget!: HTMLSelectElement;
  private uiUpgradeButton!: HTMLButtonElement;
  private uiUpgradeInfo!: HTMLElement;
  private uiProfileStatus!: HTMLElement;
  private uiEnemySelect!: HTMLSelectElement;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.enemies = [];
    this.towers = [];
    this.gems = [];
    this.occupiedCells.clear();
    this.waveSystem = new WaveSystem();
    this.waveSystem.setLevel(this.selectedLevel.waves);
    this.gameState = 'playing';
    this.isPaused = false;
    this.coins = 500;
    this.rewardedWave = 0;
    this.spawnIndex = 0;
    this.doorCells = new Set();

    const cols = 20;
    const rows = 20;
    this.tileSize = Math.min(40, Math.floor((this.scale.width - 16) / cols));
    
    this.map = new DijkstraMap(cols, rows);
    const centerX = 10;
    const centerY = 10;
    
    this.createFortressDoors(centerX, centerY);
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
    for (const cell of this.doorCells) {
      const [x, y] = cell.split(',').map(Number);
      this.gridRects[y][x].setFillStyle(0x9a7b55);
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

      const clickedTower = this.towers.find(tower => tower.sprite.getBounds().contains(pointer.x, pointer.y));
      if (clickedTower) {
        this.openUIPanel(clickedTower);
        return;
      }

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
            const enemy = new Enemy(this, x, y, this.tileSize, EnemyData[this.selectedEnemyId] ?? EnemyData.basic);
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
      delay: 450,
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
      this.progression.addExperience(this.waveSystem.wave * 20);
      this.rewardedWave = this.waveSystem.wave;
    }
    this.waveSystem.update(time, activeEnemies, this.selectedLevel.waves, enemyId => this.spawnEnemy(enemyId));
    // Ciclo de combate
    for (const tower of this.towers) {
      if (tower.isActive) tower.update(time, this.enemies, this.map, this.towers);
    }
    this.updateGameStatus();
    this.updateEconomyUI();
    if (this.selectedTower) this.updateSkillUI(this.selectedTower);
    if (this.gems.every(gem => gem.isDestroyed)) this.endGame('defeat');
    else if (this.waveSystem.wave >= this.waveSystem.maxWaves && !this.waveSystem.isSpawning && this.enemies.every(enemy => !enemy.isActive)) this.endGame('victory');
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
    this.uiDifficulty = document.getElementById('difficulty-select') as HTMLSelectElement;
    this.uiWaveDuration = document.getElementById('wave-duration') as HTMLSelectElement;
    this.uiEndScreen = document.getElementById('end-screen')!;
    this.uiEndTitle = document.getElementById('end-title')!;
    this.uiEndMessage = document.getElementById('end-message')!;
    this.uiRestartButton = document.getElementById('restart-button') as HTMLButtonElement;
    this.uiEndScreen.classList.remove('visible');
    this.uiHud = document.getElementById('game-status')!;
    this.uiHudToggle = document.getElementById('hud-toggle') as HTMLButtonElement;
    this.uiWaveButton = document.getElementById('wave-button') as HTMLButtonElement;
    this.uiWaveButton.disabled = false;
    this.uiCoins = document.getElementById('coin-status')!;
    this.uiSkills = document.getElementById('skill-status')!;
    this.uiSkillInfo = document.getElementById('skill-info')!;
    this.uiSkillModal = document.getElementById('skill-detail-modal')!;
    this.uiSkillDetailTitle = document.getElementById('skill-detail-title')!;
    this.uiSkillDetailType = document.getElementById('skill-detail-type')!;
    this.uiSkillDetailDescription = document.getElementById('skill-detail-description')!;
    this.uiSkillDetailEffects = document.getElementById('skill-detail-effects')!;
    this.uiSkillDetailCooldown = document.getElementById('skill-detail-cooldown')!;
    this.uiCloseSkillDetail = document.getElementById('close-skill-detail') as HTMLButtonElement;
    this.uiSkillTarget = document.getElementById('skill-target') as HTMLSelectElement;
    this.uiUpgradeButton = document.getElementById('upgrade-tower') as HTMLButtonElement;
    this.uiUpgradeInfo = document.getElementById('upgrade-info')!;
    this.uiProfileStatus = document.getElementById('profile-status')!;
    this.uiEnemySelect = document.getElementById('enemy-select') as HTMLSelectElement;
    this.uiSkillModal.classList.remove('visible');

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
    this.uiDifficulty.addEventListener('change', () => {
      this.difficultyMultiplier = Number(this.uiDifficulty.value);
    });
    this.uiWaveDuration.addEventListener('change', () => {
      this.waveSystem.setWaveDelay(Number(this.uiWaveDuration.value));
    });
    this.uiLevel = document.getElementById('level-select') as HTMLSelectElement;
    this.uiLevel.addEventListener('change', () => {
      this.selectedLevel = Levels[this.uiLevel.value] ?? Levels.level1;
      this.scene.restart();
    });
    this.uiRestartButton.onclick = () => this.scene.restart();
    this.uiHudToggle.addEventListener('click', () => {
      const collapsed = this.uiHud.classList.toggle('collapsed');
      this.uiHudToggle.innerText = collapsed ? 'Mostrar' : 'Ocultar';
    });
    this.uiSkills.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-skill-id]');
      const skill = this.selectedTower?.profile.skills?.find(item => item.id === button?.dataset.skillId);
      if (skill) this.showSkillInfo(skill);
    });
    this.uiSkills.addEventListener('contextmenu', event => {
      event.preventDefault();
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-skill-id]');
      const skill = this.selectedTower?.profile.skills?.find(item => item.id === button?.dataset.skillId);
      if (skill) this.showSkillInfo(skill);
    });
    this.uiCloseSkillDetail.addEventListener('click', () => this.uiSkillModal.classList.remove('visible'));
    this.uiSkillModal.addEventListener('click', event => {
      if (event.target === this.uiSkillModal) this.uiSkillModal.classList.remove('visible');
    });
    this.uiSkillTarget.addEventListener('change', () => {
      if (this.selectedTower) this.selectedTower.skillTargetPriority = this.uiSkillTarget.value as SkillTargetPriority;
    });
    this.uiUpgradeButton.addEventListener('click', () => this.upgradeSelectedTower());
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
    this.uiEnemySelect.addEventListener('change', () => {
      this.selectedEnemyId = this.uiEnemySelect.value;
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
    this.uiSkillInfo.classList.remove('visible');
    this.uiTowerName.innerText = tower.profile.name + ' - ' + tower.profile.title;
    this.uiTowerRole.innerText = 'Rol: ' + tower.profile.roles.join(', ') + ' | Daño: ' + tower.profile.baseStats.attack * tower.upgradeLevel + ' | Vida: ' + Math.ceil(tower.hp) + '/' + tower.maxHp + ' | Nv ' + tower.upgradeLevel;
    
    // Sincronizar el select
    this.uiTargetingSelect.value = tower.targetingPriority;
    this.uiSkillTarget.value = tower.skillTargetPriority;
    this.updateUpgradeUI(tower);
    this.updateSkillUI(tower);
    
    this.uiPanel.classList.add('active');
  }

  private updateSkillUI(tower: Tower) {
    const statuses = tower.getSkillStatuses(this.time.now);
    this.uiSkills.innerHTML = statuses.map(skill => {
      const description = skill.description ?? this.describeSkill(skill);
      if (skill.type === 'passive') return `<button class="skill-card passive" data-skill-id="${skill.id}"><span class="skill-copy"><span>${skill.name}</span><small class="skill-description">${description}</small></span><span class="skill-state">PASIVA</span></button>`;
      const status = skill.remainingMs > 0 ? `${(skill.remainingMs / 1000).toFixed(1)}s` : 'Lista';
      const stateClass = skill.remainingMs > 0 ? 'cooldown' : 'ready';
      return `<button class="skill-card ${stateClass}" data-skill-id="${skill.id}"><span class="skill-copy"><span>${skill.name}</span><small class="skill-description">${description}</small></span><span class="skill-state">${skill.active ? 'ACTIVA' : status}</span></button>`;
    }).join('');
    this.uiSkills.querySelectorAll<HTMLButtonElement>('[data-skill-id]').forEach(button => {
      const skill = tower.profile.skills?.find(item => item.id === button.dataset.skillId);
      if (skill) {
        button.title = skill.description ?? this.describeSkill(skill);
        button.onclick = () => this.showSkillInfo(skill);
        button.oncontextmenu = event => {
          event.preventDefault();
          this.showSkillInfo(skill);
        };
      }
    });
  }

  private updateUpgradeUI(tower: Tower) {
    this.uiUpgradeInfo.innerText = tower.upgradeLevel >= 4 ? 'Nivel máximo' : `Nivel ${tower.upgradeLevel} · ${tower.upgradeCost} monedas`;
    this.uiUpgradeButton.disabled = tower.upgradeLevel >= 4 || this.coins < tower.upgradeCost;
  }

  private upgradeSelectedTower() {
    if (!this.selectedTower || this.coins < this.selectedTower.upgradeCost) return;
    const cost = this.selectedTower.upgradeCost;
    if (this.selectedTower.upgrade()) {
      this.coins -= cost;
      this.updateUpgradeUI(this.selectedTower);
      this.uiTowerRole.innerText = `Rol: ${this.selectedTower.profile.roles.join(', ')} | Daño: ${this.selectedTower.profile.baseStats.attack * this.selectedTower.upgradeLevel} | Vida: ${Math.ceil(this.selectedTower.hp)}/${this.selectedTower.maxHp} | Nv ${this.selectedTower.upgradeLevel}`;
      VisualFX.floatText(this, this.selectedTower.sprite.x, this.selectedTower.sprite.y, '¡Mejorada!', '#facc15');
    }
  }

  private describeSkill(skill: NonNullable<CharacterProfile['skills']>[number]) {
    const effect = skill.effect;
    const details: string[] = [];
    if (effect.attackBoost) details.push(`+${Math.round(effect.attackBoost * 100)}% de ataque`);
    if (effect.speedBoost) details.push(`+${Math.round(effect.speedBoost * 100)}% de velocidad de ataque`);
    if (effect.defenseBoost) details.push(`+${Math.round(effect.defenseBoost * 100)}% de defensa`);
    if (effect.damageMultiplier) details.push(`multiplicador de daño x${effect.damageMultiplier}`);
    if (effect.healAmount) details.push(`cura ${effect.healAmount} HP`);
    if (effect.aoeMultiplier) details.push('daño en área');
    if (effect.rangeBoost) details.push(`+${Math.round(effect.rangeBoost * 100)}% de alcance`);
    if (effect.slowPercent) details.push(`ralentiza ${Math.round(effect.slowPercent * 100)}%`);
    return details.length ? details.join(' · ') : 'Efecto especial de combate.';
  }

  private showSkillInfo(skill: NonNullable<CharacterProfile['skills']>[number]) {
    this.uiSkillInfo.innerHTML = `<strong>${skill.name}</strong>${skill.description ?? this.describeSkill(skill)}`;
    this.uiSkillInfo.classList.add('visible');
    this.uiSkillDetailTitle.innerText = skill.name;
    this.uiSkillDetailType.innerText = skill.type === 'passive' ? 'Pasiva automática' : 'Activa automática';
    this.uiSkillDetailDescription.innerText = skill.description ?? `Efecto de ${skill.name}: ${this.describeSkill(skill)}.`;
    this.uiSkillDetailEffects.innerText = this.describeSkill(skill);
    this.uiSkillDetailCooldown.innerText = skill.type === 'active'
      ? `Cooldown: ${(skill.cooldownMs ?? 0) / 1000}s · Se activa automáticamente durante el combate.`
      : 'Se activa automáticamente cuando se cumple su condición.';
    this.uiSkillModal.classList.add('visible');
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
    if (this.uiProfileStatus) this.uiProfileStatus.innerText = `Perfil Nv ${this.progression.level} · ${this.progression.experience}/${this.progression.experienceToNextLevel} XP`;
    if (this.selectedTower) this.updateUpgradeUI(this.selectedTower);
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

  private spawnEnemy(enemyId: string) {
    const spawnPoints = [{ x: 0, y: 0 }, { x: 19, y: 0 }, { x: 0, y: 19 }, { x: 19, y: 19 }, { x: 10, y: 0 }, { x: 19, y: 10 }, { x: 0, y: 10 }];
    const point = spawnPoints[this.spawnIndex++ % spawnPoints.length];
    const profile = EnemyData[enemyId] ?? EnemyData.basic;
    const wave = this.waveSystem.wave;
        this.enemies.push(new Enemy(this, point.x, point.y, this.tileSize, profile, this.spawnIndex % this.gems.length, this.difficultyMultiplier + wave * 0.08, (reward, x, y) => {
          this.coins += reward;
          this.progression.addExperience(reward);
      VisualFX.floatText(this, x, y, `+${reward}`, '#fcd34d');
    }));
  }

  private updateGameStatus() {
    const aliveGems = this.gems.filter(gem => !gem.isDestroyed).length;
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive).length;
    this.uiWaveStatus.innerText = `Oleada: ${this.waveSystem.wave}/${this.waveSystem.maxWaves}`;
    this.uiGemStatus.innerText = `Joyas: ${aliveGems}/3`;
    this.uiEnemyStatus.innerText = `${activeEnemies}${this.waveSystem.isSpawning ? ' + entrando' : ''}`;
    this.uiWaveProgress.style.width = `${(this.waveSystem.wave / this.waveSystem.maxWaves) * 100}%`;
    this.uiGemProgress.style.width = `${(aliveGems / this.gems.length) * 100}%`;
  }

  private endGame(state: 'victory' | 'defeat') {
    this.gameState = state;
    this.uiGameState.innerText = state === 'victory' ? 'VICTORIA' : 'DERROTA';
    this.uiGameState.style.color = state === 'victory' ? '#86efac' : '#fca5a5';
    this.uiWaveButton.disabled = true;
    this.uiEndTitle.innerText = state === 'victory' ? 'Victoria' : 'Derrota';
    this.uiEndMessage.innerText = state === 'victory' ? 'Has sobrevivido al asedio.' : 'Las tres joyas fueron destruidas.';
    this.uiEndScreen.classList.add('visible');
  }

  moveEnemies() {
    // Limpiar enemigos muertos
    this.enemies = this.enemies.filter(e => e.isActive);
    for (const tower of this.towers.filter(tower => !tower.isActive)) {
      this.occupiedCells.delete(`${tower.gridPos.x},${tower.gridPos.y}`);
    }
    this.towers = this.towers.filter(tower => tower.isActive);

    for (const enemy of this.enemies) {
      if (enemy.gridPos.x === 10 && enemy.gridPos.y === 10) {
        const assignedGem = this.gems[enemy.targetGemIndex];
        const gem = assignedGem && !assignedGem.isDestroyed
          ? assignedGem
          : this.gems.find(candidate => !candidate.isDestroyed);
        if (gem) enemy.attackGem(gem, this.time.now);
        continue;
      }

      if (enemy.tryActivateSpecial()) {
        VisualFX.ring(this, enemy.sprite.x, enemy.sprite.y, enemy.profile.color, 34);
        VisualFX.floatText(this, enemy.sprite.x, enemy.sprite.y, enemy.profile.type === 'boss' ? '¡Furia!' : '¡Habilidad!', '#fca5a5');
      }

      const attackRange = enemy.profile.type === 'boss' ? 100 : enemy.profile.ability === 'swarm' ? 70 : 52;
      const tower = this.towers.filter(candidate => candidate.isActive && Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, candidate.sprite.x, candidate.sprite.y) <= attackRange)
        .sort((a, b) => Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, b.sprite.x, b.sprite.y))[0];
      if (tower) {
        enemy.attackTower(tower, this.time.now);
        continue;
      }

      let nextNode = enemy.profile.movement === 'flying'
        ? this.getDirectStep(enemy.gridPos.x, enemy.gridPos.y)
        : this.map.getNextStep(enemy.gridPos.x, enemy.gridPos.y);

      if (nextNode && enemy.profile.ability === 'dash' && Math.random() < 0.2) {
        nextNode = enemy.profile.movement === 'flying'
          ? this.getDirectStep(nextNode.x, nextNode.y)
          : this.map.getNextStep(nextNode.x, nextNode.y) ?? nextNode;
      }

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
        enemy.updateHealthBar(enemy.gridPos.x * this.tileSize + this.tileSize / 2, enemy.gridPos.y * this.tileSize + this.tileSize / 2);
      }
    }
  }

  private getDirectStep(x: number, y: number) {
    return { x: x + Math.sign(10 - x), y: y + Math.sign(10 - y) };
  }

  private createFortressDoors(centerX: number, centerY: number) {
    for (let x = centerX - 3; x <= centerX + 3; x++) {
      if (x !== centerX) {
        this.map.setWalkable(x, centerY - 3, false);
        this.map.setWalkable(x, centerY + 3, false);
      }
    }
    for (let y = centerY - 2; y <= centerY + 2; y++) {
      if (y !== centerY) {
        this.map.setWalkable(centerX - 3, y, false);
        this.map.setWalkable(centerX + 3, y, false);
      }
    }
    this.doorCells = new Set([
      `${centerX},${centerY - 3}`,
      `${centerX},${centerY + 3}`,
      `${centerX - 3},${centerY}`,
      `${centerX + 3},${centerY}`,
    ]);
  }

  private generateRandomObstacles(cols: number, rows: number, centerX: number, centerY: number) {
    const spawnPoints = [{ x: 0, y: 0 }, { x: 19, y: 0 }, { x: 0, y: 19 }, { x: 19, y: 19 }, { x: 10, y: 0 }, { x: 19, y: 10 }, { x: 0, y: 10 }];
    let placed = 0;
    let attempts = 0;
    while (placed < 24 && attempts++ < 150) {
      const x = 2 + Math.floor(Math.random() * (cols - 4));
      const y = 2 + Math.floor(Math.random() * (rows - 4));
      if (Math.abs(x - centerX) <= 2 && Math.abs(y - centerY) <= 2) continue;
      if (this.doorCells.has(`${x},${y}`)) continue;
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

import Phaser from 'phaser';
import { CharacterProfile, SkillTargetPriority, TargetingPriority } from '@td-nya/shared';
import { Enemy } from './Enemy';
import { DijkstraMap } from '@td-nya/game-data';
import { VisualFX } from '../effects/VisualFX';
import { CombatSystem } from '../systems/CombatSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { TargetingSystem } from '../systems/TargetingSystem';
import { HealthBar } from './HealthBar';
import { Projectile } from './Projectile';
import { MiniMosasaur } from './MiniMosasaur';

export class Tower {
  public profile: CharacterProfile;
  public sprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  public rangeGraphics: Phaser.GameObjects.Graphics;
  public targetingPriority: TargetingPriority = TargetingPriority.CLOSEST_TO_CORE;
  public skillTargetPriority: SkillTargetPriority = 'weakest';
  
  private lastFiredTime: number = 0;
  private scene: Phaser.Scene;
  private tileSize: number;
  private skillCooldowns = new Map<string, number>();
  private activeEffects = new Map<string, number>();
  private passiveReady = new Map<string, boolean>();
  private attackCount = 0;
  private nextDamageMultiplier = 1;
  private nextAoeMultiplier = 1;
  public gridPos: { x: number; y: number };
  public hp: number;
  public maxHp: number;
  public isActive = true;
  public upgradeLevel = 1;
  public globalLevel = 1;
  public isTransformed = false;
  private readonly healthBar: HealthBar;
  private summons: MiniMosasaur[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, profile: CharacterProfile, onClick: (t: Tower) => void) {
    this.scene = scene;
    this.profile = profile;
    this.gridPos = { x, y };
    this.tileSize = tileSize;
    this.maxHp = profile.baseStats.hp;
    this.hp = this.maxHp;
    this.healthBar = new HealthBar(scene, 28);

    // LoS-aware range overlay
    this.rangeGraphics = scene.add.graphics();

    // Draw tower body (on top of range overlay)
    const spriteKey = profile.id === 'xavi' ? 'xavi-human-idle' : `${profile.id}-idle`;
    this.sprite = ['tribu', 'angel', 'xavi', 'gretch', 'kiu', 'lucy', 'cesar'].includes(profile.id)
      ? scene.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, spriteKey).setDisplaySize(tileSize * (profile.id === 'angel' ? 1.1 : 0.9), tileSize * (profile.id === 'angel' ? 1.1 : 0.9))
      : scene.add.rectangle(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, tileSize * 0.8, tileSize * 0.8, 0x4444ff);
    this.healthBar.update(this.sprite.x, this.sprite.y - 21, this.hp, this.maxHp, 0x22c55e);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => {
      if (this.sprite instanceof Phaser.GameObjects.Rectangle) {
        this.sprite.setStrokeStyle(2, 0xffffff);
        scene.time.delayedCall(200, () => this.sprite instanceof Phaser.GameObjects.Rectangle && this.sprite.setStrokeStyle(0));
      }
      onClick(this);
    });
  }

  /**
   * Redraw the LoS-aware range polygon using raycasting.
   * Should be called after placement and after any wall changes.
   */
  drawRange(map: DijkstraMap) {
    this.rangeGraphics.clear();

    const cx = this.gridPos.x * this.tileSize + this.tileSize / 2;
    const cy = this.gridPos.y * this.tileSize + this.tileSize / 2;
    const maxRange = this.profile.baseStats.range;
    const RAY_COUNT = 120; // smoothness

    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      // Step along the ray in pixel increments
      let hit = maxRange; // assume open until wall found
      for (let dist = 0; dist <= maxRange; dist += this.tileSize * 0.5) {
        const px = cx + dx * dist;
        const py = cy + dy * dist;
        const gx = Math.floor(px / this.tileSize);
        const gy = Math.floor(py / this.tileSize);

        if (
          gy < 0 || gy >= map.grid.length ||
          gx < 0 || gx >= map.grid[0].length
        ) {
          hit = dist;
          break;
        }

        if (!map.grid[gy][gx].isWalkable && !(gx === this.gridPos.x && gy === this.gridPos.y)) {
          // Stop just before the wall cell edge
          hit = Math.max(0, dist - this.tileSize * 0.5);
          break;
        }
      }

      points.push({
        x: cx + dx * hit,
        y: cy + dy * hit,
      });
    }

    // Filled LoS polygon
    this.rangeGraphics.fillStyle(0x4466ff, 0.12);
    this.rangeGraphics.beginPath();
    this.rangeGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.rangeGraphics.lineTo(points[i].x, points[i].y);
    }
    this.rangeGraphics.closePath();
    this.rangeGraphics.fillPath();

    // Outline
    this.rangeGraphics.lineStyle(1, 0x4466ff, 0.5);
    this.rangeGraphics.beginPath();
    this.rangeGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.rangeGraphics.lineTo(points[i].x, points[i].y);
    }
    this.rangeGraphics.closePath();
    this.rangeGraphics.strokePath();
  }

  update(time: number, enemies: Enemy[], map: DijkstraMap, towers: Tower[] = []) {
    for (const summon of this.summons) summon.update(time, enemies);
    this.updateSkills(time, enemies, map, towers);
    const speedBoost = towers.reduce((boost, tower) => boost + tower.getSpeedBoostFor(this, time), 0);
    const fireCooldownMs = 1000 / (this.profile.baseStats.attackSpeed * this.upgradeLevel * (1 + speedBoost));
    if (time - this.lastFiredTime < fireCooldownMs) return;

    const inRange = enemies.filter(e => {
      if (!e.isActive) return false;
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, e.sprite.x, e.sprite.y);
      if (dist > this.profile.baseStats.range) return false;
      return this.hasLineOfSight(this.gridPos.x, this.gridPos.y, e.gridPos.x, e.gridPos.y, map);
    });

    if (inRange.length === 0) return;

    const target = TargetingSystem.select(this, inRange, map);
    if (target) {
      this.fire(target, enemies, map, towers);
      this.lastFiredTime = time;
    }
  }

  private hasLineOfSight(x0: number, y0: number, x1: number, y1: number, map: DijkstraMap): boolean {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (!(x0 === this.gridPos.x && y0 === this.gridPos.y) && map.grid[y0] && map.grid[y0][x0] && !map.grid[y0][x0].isWalkable) return false;
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return true;
  }

  private fire(target: Enemy, enemies: Enemy[], map: DijkstraMap, towers: Tower[]) {
    Projectile.fire(this.scene, this.sprite, target.sprite, this.profile.id, () => undefined);
    const line = this.scene.add.line(
      0, 0,
      this.sprite.x, this.sprite.y,
      target.sprite.x, target.sprite.y,
      0xffff00, 1
    ).setOrigin(0);

    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 150,
      onComplete: () => line.destroy()
    });

    this.attackCount++;
    let damageMultiplier = this.nextDamageMultiplier;
    const aoeMultiplier = this.nextAoeMultiplier;
    this.nextDamageMultiplier = 1;
    this.nextAoeMultiplier = 1;

    if (this.profile.id === 'kiu' && this.attackCount % 3 === 0) {
      damageMultiplier *= 2;
      VisualFX.burstParticles(this.scene, this.sprite.x, this.sprite.y, 0xff9800);
    }

    const attackBoost = towers.reduce((boost, tower) => boost + tower.getAttackBoostFor(this, towers, map), 0);
    const globalMultiplier = 1 + (this.globalLevel - 1) * 0.03;
    const damage = CombatSystem.calculateDamage(this.profile.baseStats.attack * this.upgradeLevel * globalMultiplier, attackBoost, damageMultiplier);
    target.takeDamage(damage);
    if (aoeMultiplier > 1) {
      for (const enemy of enemies) {
        if (enemy !== target && enemy.isActive && this.isInRange(enemy)) enemy.takeDamage(damage * aoeMultiplier);
      }
    }
  }

  private updateSkills(time: number, enemies: Enemy[], map: DijkstraMap, towers: Tower[]) {
    for (const skill of this.profile.skills ?? []) {
      if (skill.type === 'passive') {
        const allies = this.getAllies(towers, map);
        const lowAlly = allies.some(tower => tower.hp < tower.maxHp * 0.5);
        const active = skill.passiveTrigger === 'always' ||
          (skill.passiveTrigger === 'ally_nearby' && allies.length >= (this.profile.id === 'gretch' ? 2 : 1)) ||
          (skill.passiveTrigger === 'low_hp' && (this.hp < this.maxHp * 0.5 || lowAlly)) ||
          skill.passiveTrigger === 'on_attack';
        const wasActive = this.passiveReady.get(skill.id) ?? false;
        this.passiveReady.set(skill.id, active);
        if (active && !wasActive && skill.particleColor !== undefined) {
          VisualFX.burstParticles(this.scene, this.sprite.x, this.sprite.y, skill.particleColor);
        }
        if (active && skill.id === 'abyss-companions' && skill.effect.summonCount) {
          while (this.summons.length < skill.effect.summonCount) this.summons.push(new MiniMosasaur(this.scene, this.sprite.x, this.sprite.y));
        }
        if (active && this.profile.id === 'gretch' && skill.effect.aoeMultiplier && this.nextAoeMultiplier === 1) {
          this.nextAoeMultiplier = skill.effect.aoeMultiplier;
        }
        if (active && skill.effect.healAmount && lowAlly && (this.skillCooldowns.get(skill.id) ?? 0) <= time) {
          const target = allies.filter(tower => tower.hp < tower.maxHp * 0.5).sort((a, b) => a.hp - b.hp)[0];
          if (target) {
            target.heal(skill.effect.healAmount);
            this.skillCooldowns.set(skill.id, time + 1000);
          }
        }
      } else if (SkillSystem.isReady(this.skillCooldowns, skill.id, time) &&
        ((!skill.effect.damageMultiplier && !skill.effect.aoeMultiplier) || enemies.some(enemy => enemy.isActive && this.isInRange(enemy)))) {
        this.activateSkill(skill, time, enemies, map, towers);
        SkillSystem.setCooldown(this.skillCooldowns, skill.id, time, skill.cooldownMs ?? 0);
      }
    }
  }

  private activateSkill(skill: NonNullable<CharacterProfile['skills']>[number], time: number, enemies: Enemy[], map: DijkstraMap, towers: Tower[]) {
    this.activeEffects.set(skill.id, time + 3000);
    if (skill.flavorText) VisualFX.floatText(this.scene, this.sprite.x, this.sprite.y, skill.flavorText, '#ffe082');
    VisualFX.ring(this.scene, this.sprite.x, this.sprite.y, skill.particleColor ?? 0xbb86fc, skill.effect.aoeMultiplier ? 70 : 42);
    VisualFX.burstParticles(this.scene, this.sprite.x, this.sprite.y, skill.particleColor ?? 0xbb86fc);
    if (skill.effect.damageMultiplier && this.profile.id !== 'cesar') this.nextDamageMultiplier = skill.effect.damageMultiplier;
    if (skill.id === 'mosasaur-era' && this.sprite instanceof Phaser.GameObjects.Image) {
      this.isTransformed = true;
      this.sprite.setTexture('xavi-mosasaur-idle').setDisplaySize(this.tileSize * 1.25, this.tileSize * 1.25);
      this.scene.time.delayedCall(3000, () => {
        if (this.sprite instanceof Phaser.GameObjects.Image) {
          this.isTransformed = false;
          this.sprite.setTexture('xavi-human-idle').setDisplaySize(this.tileSize * 0.9, this.tileSize * 0.9);
        }
      });
    }
    if (skill.id === 'call-of-abyss') this.summons.push(new MiniMosasaur(this.scene, this.sprite.x, this.sprite.y, true));
    if (skill.effect.healAmount) {
      const allies = this.getAllies(towers, map);
      const targets = this.skillTargetPriority === 'all' ? allies : [this.selectSkillAlly(allies)];
      for (const target of targets) if (target) {
        target.heal(skill.effect.healAmount);
        VisualFX.ring(this.scene, target.sprite.x, target.sprite.y, 0x66bb6a, 30);
      }
    }
    if (skill.effect.damageMultiplier === 4) {
      const target = enemies.filter(enemy => enemy.isActive && this.isInRange(enemy))
        .sort((a, b) => Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, b.sprite.x, b.sprite.y))[0];
      if (target) {
        target.takeDamage(this.profile.baseStats.attack * 4);
        VisualFX.impact(this.scene, target.sprite.x, target.sprite.y, 0xffffff);
      }
    }
    if (skill.id === 'pack-bite') {
      const target = enemies.filter(enemy => enemy.isActive && this.isInRange(enemy)).sort((a, b) => Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, b.sprite.x, b.sprite.y))[0];
      if (target) {
        target.takeDamage(this.profile.baseStats.attack * 2);
        VisualFX.impact(this.scene, target.sprite.x, target.sprite.y, 0x29b6f6);
      }
    }
    if (skill.id === 'wild-current') {
      for (const enemy of enemies) if (enemy.isActive && this.isInRange(enemy)) {
        enemy.takeDamage(this.profile.baseStats.attack * 1.5);
        enemy.applyStatus('slow', 3000, time, skill.effect.slowPercent ?? 0.35);
        VisualFX.impact(this.scene, enemy.sprite.x, enemy.sprite.y, 0x29b6f6);
        VisualFX.floatText(this.scene, enemy.sprite.x, enemy.sprite.y, `SLOW ${Math.round((skill.effect.slowPercent ?? 0.35) * 100)}%`, '#67e8f9');
      }
    }
    if (skill.id === 'princess-arc' || skill.id === 'regroup') {
      for (const enemy of enemies) if (enemy.isActive && this.isInRange(enemy)) {
        enemy.applyStatus('marked', 5000, time, 0.25);
        VisualFX.floatText(this.scene, enemy.sprite.x, enemy.sprite.y, 'MARCADO', '#f9a8d4');
      }
    }
    if (skill.effect.aoeMultiplier && this.profile.id === 'gretch') {
      for (const enemy of enemies) if (enemy.isActive && this.isInRange(enemy)) {
        enemy.takeDamage(this.profile.baseStats.attack * 2);
        VisualFX.impact(this.scene, enemy.sprite.x, enemy.sprite.y, skill.particleColor ?? 0xec407a);
      }
    }
  }

  private getAllies(towers: Tower[], map: DijkstraMap) {
    return towers.filter(tower => tower !== this && tower.isActive &&
      Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, tower.sprite.x, tower.sprite.y) <= this.profile.baseStats.range &&
      this.hasLineOfSight(this.gridPos.x, this.gridPos.y, tower.gridPos.x, tower.gridPos.y, map));
  }

  private selectSkillAlly(allies: Tower[]) {
    if (this.skillTargetPriority === 'strongest') return allies.sort((a, b) => b.maxHp - a.maxHp)[0];
    if (this.skillTargetPriority === 'closest') return allies.sort((a, b) => Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, b.sprite.x, b.sprite.y))[0];
    return allies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  }

  private isInRange(enemy: Enemy) {
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, enemy.sprite.x, enemy.sprite.y) <= this.profile.baseStats.range;
  }

  getAttackBoostFor(target: Tower, towers: Tower[], map: DijkstraMap) {
    let boost = 0;
    for (const skill of this.profile.skills ?? []) {
      const inRange = this.getAllies(towers, map).includes(target);
      const passive = skill.type === 'passive' && this.passiveReady.get(skill.id) && inRange;
      const active = skill.type === 'active' && (this.activeEffects.get(skill.id) ?? 0) > this.scene.time.now && inRange;
      if (passive || active) boost += skill.effect.attackBoost ?? 0;
    }
    return boost;
  }

  getSpeedBoostFor(target: Tower, time: number) {
    let boost = 0;
    for (const skill of this.profile.skills ?? []) {
      const inRange = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.sprite.x, target.sprite.y) <= this.profile.baseStats.range;
      if (skill.type === 'active' && inRange && (this.activeEffects.get(skill.id) ?? 0) > time) boost += skill.effect.speedBoost ?? 0;
    }
    return boost;
  }

  heal(amount: number) {
    if (!this.isActive) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.healthBar.update(this.sprite.x, this.sprite.y - 21, this.hp, this.maxHp, 0x22c55e);
    VisualFX.floatText(this.scene, this.sprite.x, this.sprite.y, `+${amount}`, '#86efac');
  }

  takeDamage(amount: number, towers: Tower[] = []) {
    if (!this.isActive) return;
    let defenseBoost = 0;
    for (const skill of this.profile.skills ?? []) {
      if (skill.type === 'passive' && this.passiveReady.get(skill.id)) defenseBoost += skill.effect.defenseBoost ?? 0;
      if (skill.type === 'active' && (this.activeEffects.get(skill.id) ?? 0) > this.scene.time.now) defenseBoost += skill.effect.defenseBoost ?? 0;
    }
    for (const source of towers) {
      if (source === this || !source.isActive) continue;
      const inRange = Phaser.Math.Distance.Between(source.sprite.x, source.sprite.y, this.sprite.x, this.sprite.y) <= source.profile.baseStats.range;
      if (!inRange) continue;
      for (const skill of source.profile.skills ?? []) {
        if (skill.type === 'active' && (source.activeEffects.get(skill.id) ?? 0) > this.scene.time.now) defenseBoost += (1 - (skill.effect.damageTakenMultiplier ?? 1));
      }
    }
    const reducedDamage = amount * (100 / (100 + this.profile.baseStats.defense * (1 + defenseBoost)));
    this.hp = Math.max(0, this.hp - reducedDamage);
    this.healthBar.update(this.sprite.x, this.sprite.y - 21, this.hp, this.maxHp, 0x22c55e);
    if (this.sprite instanceof Phaser.GameObjects.Rectangle) {
      this.sprite.setFillStyle(0xffffff);
      this.scene.time.delayedCall(100, () => this.isActive && this.sprite instanceof Phaser.GameObjects.Rectangle && this.sprite.setFillStyle(0x4444ff));
    }
    VisualFX.floatText(this.scene, this.sprite.x, this.sprite.y, `-${Math.ceil(reducedDamage)}`, '#fca5a5');
    if (this.hp === 0) {
      this.isActive = false;
      this.sprite.setAlpha(0.35);
    }
  }

  getSkillStatuses(time: number) {
    return (this.profile.skills ?? []).map(skill => ({
      name: skill.name,
      id: skill.id,
      type: skill.type,
      description: skill.description,
      effect: skill.effect,
      remainingMs: skill.type === 'active' ? Math.max(0, (this.skillCooldowns.get(skill.id) ?? 0) - time) : 0,
      active: skill.type === 'active' && (this.activeEffects.get(skill.id) ?? 0) > time,
    }));
  }

  get upgradeCost() { return 100 * this.upgradeLevel; }

  upgrade() {
    if (this.upgradeLevel >= 4) return false;
    this.upgradeLevel++;
    const previousMaxHp = this.maxHp;
    this.maxHp = Math.round(this.maxHp * 1.2);
    this.hp += this.maxHp - previousMaxHp;
    this.healthBar.update(this.sprite.x, this.sprite.y - 21, this.hp, this.maxHp, 0x22c55e);
    VisualFX.ring(this.scene, this.sprite.x, this.sprite.y, 0xfacc15, 35);
    return true;
  }

  destroy() {
    this.healthBar.destroy();
    this.rangeGraphics.destroy();
    this.sprite.destroy();
  }
}

import Phaser from 'phaser';
import { CharacterProfile, TargetingPriority } from '@td-nya/shared';
import { Enemy } from './Enemy';
import { DijkstraMap } from '@td-nya/game-data';
import { VisualFX } from '../effects/VisualFX';
import { CombatSystem } from '../systems/CombatSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { TargetingSystem } from '../systems/TargetingSystem';

export class Tower {
  public profile: CharacterProfile;
  public sprite: Phaser.GameObjects.Rectangle;
  public rangeGraphics: Phaser.GameObjects.Graphics;
  public targetingPriority: TargetingPriority = TargetingPriority.CLOSEST_TO_CORE;
  
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
  public readonly maxHp: number;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, profile: CharacterProfile, onClick: (t: Tower) => void) {
    this.scene = scene;
    this.profile = profile;
    this.gridPos = { x, y };
    this.tileSize = tileSize;
    this.maxHp = profile.baseStats.hp;
    this.hp = this.maxHp;

    // LoS-aware range overlay
    this.rangeGraphics = scene.add.graphics();

    // Draw tower body (on top of range overlay)
    this.sprite = scene.add.rectangle(
      x * tileSize + tileSize / 2,
      y * tileSize + tileSize / 2,
      tileSize * 0.8,
      tileSize * 0.8,
      0x4444ff
    );

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => {
      this.sprite.setStrokeStyle(2, 0xffffff);
      scene.time.delayedCall(200, () => this.sprite.setStrokeStyle(0));
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

        if (!map.grid[gy][gx].isWalkable) {
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
    this.updateSkills(time, enemies, map, towers);
    const speedBoost = towers.reduce((boost, tower) => boost + tower.getSpeedBoostFor(this, time), 0);
    const fireCooldownMs = 1000 / (this.profile.baseStats.attackSpeed * (1 + speedBoost));
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
      if (map.grid[y0] && map.grid[y0][x0] && !map.grid[y0][x0].isWalkable) return false;
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return true;
  }

  private fire(target: Enemy, enemies: Enemy[], map: DijkstraMap, towers: Tower[]) {
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
    const damage = CombatSystem.calculateDamage(this.profile.baseStats.attack, attackBoost, damageMultiplier);
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
          (skill.passiveTrigger === 'low_hp' && (this.hp < this.maxHp * 0.5 || lowAlly));
        const wasActive = this.passiveReady.get(skill.id) ?? false;
        this.passiveReady.set(skill.id, active);
        if (active && !wasActive && skill.particleColor !== undefined) {
          VisualFX.burstParticles(this.scene, this.sprite.x, this.sprite.y, skill.particleColor);
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
        (this.profile.id !== 'gretch' || enemies.some(enemy => enemy.isActive && this.isInRange(enemy)))) {
        this.activateSkill(skill, time, enemies, map, towers);
        SkillSystem.setCooldown(this.skillCooldowns, skill.id, time, skill.cooldownMs ?? 0);
      }
    }
  }

  private activateSkill(skill: NonNullable<CharacterProfile['skills']>[number], time: number, enemies: Enemy[], map: DijkstraMap, towers: Tower[]) {
    this.activeEffects.set(skill.id, time + 3000);
    if (skill.flavorText) VisualFX.floatText(this.scene, this.sprite.x, this.sprite.y, skill.flavorText, '#ffe082');
    if (skill.effect.damageMultiplier && this.profile.id !== 'cesar') this.nextDamageMultiplier = skill.effect.damageMultiplier;
    if (skill.effect.healAmount) {
      const target = this.getAllies(towers, map).sort((a, b) => a.hp - b.hp)[0];
      target?.heal(skill.effect.healAmount);
    }
    if (skill.effect.damageMultiplier === 4) {
      const target = enemies.filter(enemy => enemy.isActive && this.isInRange(enemy))
        .sort((a, b) => Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, b.sprite.x, b.sprite.y))[0];
      target?.takeDamage(this.profile.baseStats.attack * 4);
    }
    if (skill.effect.aoeMultiplier && this.profile.id === 'gretch') {
      for (const enemy of enemies) if (enemy.isActive && this.isInRange(enemy)) enemy.takeDamage(this.profile.baseStats.attack * 2);
    }
  }

  private getAllies(towers: Tower[], map: DijkstraMap) {
    return towers.filter(tower => tower !== this &&
      Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, tower.sprite.x, tower.sprite.y) <= this.profile.baseStats.range &&
      this.hasLineOfSight(this.gridPos.x, this.gridPos.y, tower.gridPos.x, tower.gridPos.y, map));
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
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  destroy() {
    this.rangeGraphics.destroy();
    this.sprite.destroy();
  }
}

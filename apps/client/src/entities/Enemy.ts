import Phaser from 'phaser';
import { SacredGem } from './SacredGem';
import { EnemyProfile, StatusEffect, StatusEffectType } from '@td-nya/shared';
import { HealthBar } from './HealthBar';
import type { Tower } from './Tower';

export class Enemy {
  public sprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  public gridPos: { x: number; y: number };
  public hp: number;
  public maxHp: number;
  public speed: number;
  public isActive: boolean;
  public readonly profile: EnemyProfile;
  public attackDamage: number;
  public targetGemIndex: number;
  private readonly onDefeated?: (reward: number, x: number, y: number) => void;
  private readonly healthBar: HealthBar;
  private lastGemAttack = 0;
  private specialUsed = false;
  private statuses = new Map<StatusEffectType, StatusEffect>();
  private lastStatusTick = 0;
  private lastMove = 0;
  private origin: { x: number; y: number };

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, profile: EnemyProfile, targetGemIndex = 0, difficulty = 1, onDefeated?: (reward: number, x: number, y: number) => void, origin = { x: 0, y: 0 }) {
    this.profile = profile;
    this.origin = origin;
    this.gridPos = { x, y };
    this.maxHp = profile.maxHp * difficulty;
    this.hp = this.maxHp;
    this.speed = profile.speed;
    this.attackDamage = profile.attackDamage * difficulty;
    this.targetGemIndex = targetGemIndex;
    this.onDefeated = onDefeated;
    this.isActive = true;

    this.sprite = profile.id === 'pibble'
      ? scene.add.image(origin.x + x * tileSize + tileSize / 2, origin.y + y * tileSize + tileSize / 2, 'pibble-idle').setDisplaySize(tileSize * 1.35, tileSize * 1.35)
      : scene.add.rectangle(origin.x + x * tileSize + tileSize / 2, origin.y + y * tileSize + tileSize / 2, tileSize * 0.6, tileSize * 0.6, profile.color);
    this.healthBar = new HealthBar(scene, 24);
    this.updateHealthBar();
  }

  takeDamage(amount: number) {
    if (!this.isActive) return;
    
    const markedMultiplier = this.statuses.has('marked') ? 1.25 : 1;
    this.hp -= Math.max(1, (amount * markedMultiplier) - (this.profile.defense ?? 0));
    this.updateHealthBar();
    
    // Feedback visual (parpadeo blanco)
    const scene = this.sprite.scene;
    if (this.sprite instanceof Phaser.GameObjects.Rectangle) {
      this.sprite.setFillStyle(0xffffff);
      scene.time.delayedCall(100, () => {
        if (this.isActive && this.sprite instanceof Phaser.GameObjects.Rectangle) {
           this.sprite.setFillStyle(this.profile.color);
        // Bajar opacidad según vida
        this.sprite.setAlpha(Math.max(0.3, this.hp / this.maxHp));
        }
      });
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  applyStatus(type: StatusEffectType, durationMs: number, time: number, value = 0) {
    this.statuses.set(type, { type, expiresAt: time + durationMs, value });
    return true;
  }

  updateStatuses(time: number) {
    for (const [type, status] of this.statuses) {
      if (status.expiresAt <= time) this.statuses.delete(type);
    }
    const burn = this.statuses.get('burn');
    if (burn && time - this.lastStatusTick >= 500) {
      this.hp = Math.max(0, this.hp - (burn.value ?? 5));
      this.lastStatusTick = time;
      this.updateHealthBar();
      if (this.hp === 0) this.die();
    }
  }

  get isStunned() { return this.statuses.has('stun'); }

  shouldMove(time: number, tickMs: number) {
    const slow = this.statuses.get('slow')?.value ?? 0;
    const interval = tickMs * (1 + slow) / Math.max(0.5, this.speed);
    if (time - this.lastMove < interval) return false;
    this.lastMove = time;
    return true;
  }

  die() {
    this.isActive = false;
    this.onDefeated?.(this.profile.reward, this.sprite.x, this.sprite.y);
    this.sprite.destroy();
    this.healthBar.destroy();
  }

  updateHealthBar(x = this.sprite.x, y = this.sprite.y) {
    this.healthBar.update(x, y - 20, this.hp, this.maxHp, 0xef4444);
  }

  tryActivateSpecial() {
    if (this.specialUsed) return false;
    if (this.profile.ability === 'rage' && this.hp <= this.maxHp * 0.5) {
      this.attackDamage *= 1.5;
      this.specialUsed = true;
      return true;
    }
    return false;
  }

  attackGem(gem: SacredGem, time: number) {
    if (time - this.lastGemAttack < this.profile.attackCooldownMs) return;
    if (this.profile.physicalDamage && this.profile.magicDamage) {
      gem.takeDamage(this.profile.physicalDamage);
      gem.takeDamage(this.profile.magicDamage);
    } else gem.takeDamage(this.attackDamage);
    this.lastGemAttack = time;
  }

  attackTower(tower: Tower, time: number, towers: Tower[] = []) {
    if (time - this.lastGemAttack < this.profile.attackCooldownMs) return;
    if (this.profile.physicalDamage && this.profile.magicDamage) {
      tower.takeDamage(this.profile.physicalDamage, towers);
      tower.takeDamage(this.profile.magicDamage, towers);
    } else tower.takeDamage(this.attackDamage, towers);
    this.lastGemAttack = time;
  }
}

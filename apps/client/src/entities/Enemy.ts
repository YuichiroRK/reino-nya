import Phaser from 'phaser';
import { SacredGem } from './SacredGem';
import { EnemyProfile } from '@td-nya/shared';

export class Enemy {
  public sprite: Phaser.GameObjects.Rectangle;
  public gridPos: { x: number; y: number };
  public hp: number;
  public maxHp: number;
  public speed: number;
  public isActive: boolean;
  public readonly profile: EnemyProfile;
  public attackDamage: number;
  public targetGemIndex: number;
  private lastGemAttack = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, profile: EnemyProfile, targetGemIndex = 0, difficulty = 1) {
    this.profile = profile;
    this.gridPos = { x, y };
    this.maxHp = profile.maxHp * difficulty;
    this.hp = this.maxHp;
    this.speed = profile.speed;
    this.attackDamage = profile.attackDamage * difficulty;
    this.targetGemIndex = targetGemIndex;
    this.isActive = true;

    this.sprite = scene.add.rectangle(
      x * tileSize + tileSize / 2,
      y * tileSize + tileSize / 2,
      tileSize * 0.6,
      tileSize * 0.6,
      profile.color
    );
  }

  takeDamage(amount: number) {
    if (!this.isActive) return;
    
    this.hp -= Math.max(1, amount - (this.profile.defense ?? 0));
    
    // Feedback visual (parpadeo blanco)
    const scene = this.sprite.scene;
    this.sprite.setFillStyle(0xffffff);
    scene.time.delayedCall(100, () => {
      if (this.isActive) {
         this.sprite.setFillStyle(this.profile.color);
        // Bajar opacidad según vida
        this.sprite.setAlpha(Math.max(0.3, this.hp / this.maxHp));
      }
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isActive = false;
    this.sprite.destroy();
  }

  attackGem(gem: SacredGem, time: number) {
    if (time - this.lastGemAttack < this.profile.attackCooldownMs) return;
    gem.takeDamage(this.attackDamage);
    this.lastGemAttack = time;
  }
}

import { EnemyProfile } from '@td-nya/shared';

export const EnemyData: Record<string, EnemyProfile> = {
  basic: { id: 'basic', name: 'Goblin', type: 'basic', movement: 'ground', maxHp: 100, speed: 1, attackDamage: 10, attackCooldownMs: 1000, color: 0xff5252, reward: 20 },
  runner: { id: 'runner', name: 'Goblin veloz', type: 'runner', movement: 'ground', maxHp: 60, speed: 2, attackDamage: 7, attackCooldownMs: 800, color: 0xffb74d, reward: 25 },
  armored: { id: 'armored', name: 'Goblin blindado', type: 'armored', movement: 'ground', maxHp: 260, speed: 0.7, attackDamage: 18, attackCooldownMs: 1200, color: 0x78909c, defense: 20, reward: 40 },
  flying: { id: 'flying', name: 'Murcielago', type: 'flying', movement: 'flying', maxHp: 90, speed: 1.5, attackDamage: 12, attackCooldownMs: 900, color: 0xce93d8, reward: 30 },
  boss: { id: 'boss', name: 'Jefe Goblin', type: 'boss', movement: 'ground', maxHp: 1000, speed: 0.5, attackDamage: 35, attackCooldownMs: 1500, color: 0x7e57c2, defense: 30, reward: 150 },
};

export const Waves = [
  { number: 1, entries: [{ enemyId: 'basic', count: 4, intervalMs: 350 }] },
  { number: 2, entries: [{ enemyId: 'basic', count: 4 }, { enemyId: 'runner', count: 2, intervalMs: 500 }] },
  { number: 3, entries: [{ enemyId: 'basic', count: 4 }, { enemyId: 'armored', count: 2 }] },
  { number: 4, entries: [{ enemyId: 'runner', count: 4 }, { enemyId: 'flying', count: 3 }] },
  { number: 5, entries: [{ enemyId: 'armored', count: 3 }, { enemyId: 'flying', count: 3 }, { enemyId: 'boss', count: 1 }] },
];

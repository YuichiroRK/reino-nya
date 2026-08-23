import { EnemyProfile } from '@td-nya/shared';

export const EnemyData: Record<string, EnemyProfile> = {
  basic: { id: 'basic', name: 'Goblin', type: 'basic', movement: 'ground', maxHp: 100, speed: 1, attackDamage: 10, attackCooldownMs: 1000, color: 0xff5252, reward: 20 },
  runner: { id: 'runner', name: 'Goblin veloz', type: 'runner', movement: 'ground', maxHp: 60, speed: 2, attackDamage: 7, attackCooldownMs: 800, color: 0xffb74d, reward: 25, ability: 'dash' },
  armored: { id: 'armored', name: 'Goblin blindado', type: 'armored', movement: 'ground', maxHp: 260, speed: 0.7, attackDamage: 18, attackCooldownMs: 1200, color: 0x78909c, defense: 20, reward: 40, ability: 'shield' },
  flying: { id: 'flying', name: 'Murcielago', type: 'flying', movement: 'flying', maxHp: 90, speed: 1.5, attackDamage: 12, attackCooldownMs: 900, color: 0xce93d8, reward: 30, ability: 'swarm' },
  boss: { id: 'boss', name: 'Jefe Goblin', type: 'boss', movement: 'ground', maxHp: 1000, speed: 0.5, attackDamage: 35, attackCooldownMs: 1500, color: 0x7e57c2, defense: 30, reward: 150, ability: 'rage' },
  pibble: { id: 'pibble', name: 'Pibble Goblin', type: 'boss', movement: 'ground', maxHp: 1800, speed: 0.55, attackDamage: 100, attackCooldownMs: 1500, color: 0x9c27b0, defense: 35, reward: 250, ability: 'rage', physicalDamage: 55, magicDamage: 45 },
};

export const Waves = [
  { number: 1, entries: [{ enemyId: 'basic', count: 4, intervalMs: 1100 }] },
  { number: 2, entries: [{ enemyId: 'basic', count: 5, intervalMs: 950 }, { enemyId: 'runner', count: 2, intervalMs: 1200 }] },
  { number: 3, entries: [{ enemyId: 'basic', count: 6, intervalMs: 850 }, { enemyId: 'armored', count: 2, intervalMs: 1500 }] },
  { number: 4, entries: [{ enemyId: 'runner', count: 5, intervalMs: 800 }, { enemyId: 'flying', count: 3, intervalMs: 1300 }] },
  { number: 5, entries: [{ enemyId: 'armored', count: 4, intervalMs: 1400 }, { enemyId: 'flying', count: 4, intervalMs: 1000 }, { enemyId: 'pibble', count: 1, intervalMs: 2000 }] },
];

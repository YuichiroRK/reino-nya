export class CombatSystem {
  static calculateDamage(baseAttack: number, attackBoost: number, multiplier: number) {
    return baseAttack * (1 + attackBoost) * multiplier;
  }
}

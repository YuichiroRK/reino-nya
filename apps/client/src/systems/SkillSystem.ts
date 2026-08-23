export class SkillSystem {
  static isReady(cooldowns: Map<string, number>, skillId: string, time: number) {
    return (cooldowns.get(skillId) ?? 0) <= time;
  }

  static setCooldown(cooldowns: Map<string, number>, skillId: string, time: number, cooldownMs: number) {
    cooldowns.set(skillId, time + cooldownMs);
  }
}

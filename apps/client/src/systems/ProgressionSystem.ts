export class ProgressionSystem {
  private readonly storageKey = 'td-nya-player-progression';
  public level = 1;
  public experience = 0;
  public readonly maxLevel = 40;

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const data = JSON.parse(saved) as { level?: number; experience?: number };
      this.level = Math.min(this.maxLevel, data.level ?? 1);
      this.experience = data.experience ?? 0;
    }
  }

  get experienceToNextLevel() { return 100 + (this.level - 1) * 50; }

  addExperience(amount: number) {
    if (this.level >= this.maxLevel) return;
    this.experience += amount;
    while (this.experience >= this.experienceToNextLevel && this.level < this.maxLevel) {
      this.experience -= this.experienceToNextLevel;
      this.level++;
    }
    localStorage.setItem(this.storageKey, JSON.stringify({ level: this.level, experience: this.experience }));
  }
}

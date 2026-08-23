export interface CharacterProgress {
  level: number;
  experience: number;
}

export class CharacterProgressionSystem {
  private readonly storageKey = 'td-nya-character-progression';
  private readonly progress: Record<string, CharacterProgress>;

  constructor() {
    try {
      this.progress = JSON.parse(localStorage.getItem(this.storageKey) ?? '{}') as Record<string, CharacterProgress>;
    } catch {
      this.progress = {};
    }
  }

  get(characterId: string) {
    return this.progress[characterId] ?? { level: 1, experience: 0 };
  }

  addExperience(characterId: string, amount: number) {
    const current = this.get(characterId);
    const next = { ...current };
    next.experience += amount;
    while (next.experience >= 100 + (next.level - 1) * 50) {
      next.experience -= 100 + (next.level - 1) * 50;
      next.level++;
    }
    this.progress[characterId] = next;
    localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
  }
}

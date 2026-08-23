import { WaveDefinition } from '@td-nya/shared';

export class WaveSystem {
  public wave = 0;
  public readonly maxWaves = 5;
  private nextWaveAt = 12000;
  private waveDelay = 15000;
  private waves: WaveDefinition[] = [];
  private pending: { enemyId: string; remaining: number; intervalMs: number; nextSpawnAt: number }[] = [];
  public started = false;

  setLevel(waves: WaveDefinition[]) {
    this.waves = waves;
  }
  start(time: number) {
    this.started = true;
    this.nextWaveAt = time;
  }

  update(time: number, activeEnemies: number, waves: WaveDefinition[], spawn: (enemyId: string) => void) {
    if (!this.started) return false;
    if (this.pending.length > 0) {
      const entry = this.pending[0];
      if (time >= entry.nextSpawnAt) {
        spawn(entry.enemyId);
        entry.remaining--;
        entry.nextSpawnAt = time + entry.intervalMs;
        if (entry.remaining <= 0) this.pending.shift();
      }
      return false;
    }
    if (this.wave >= this.maxWaves) return activeEnemies === 0;
    if (time < this.nextWaveAt || activeEnemies > 0) return false;
    this.wave++;
    const wave = (this.waves.length ? this.waves : waves)[this.wave - 1];
    if (wave) {
      this.pending = wave.entries.map(entry => ({ enemyId: entry.enemyId, remaining: entry.count, intervalMs: entry.intervalMs ?? 500, nextSpawnAt: time }));
    }
    this.nextWaveAt = time + this.waveDelay;
    return false;
  }

  setWaveDelay(delayMs: number) { this.waveDelay = delayMs; }
  get isSpawning() { return this.pending.length > 0; }
}

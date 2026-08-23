export class WaveSystem {
  public wave = 0;
  public readonly maxWaves = 5;
  private nextWaveAt = 5000;

  update(time: number, activeEnemies: number, spawn: (wave: number, count: number) => void) {
    if (this.wave >= this.maxWaves) return activeEnemies === 0;
    if (time < this.nextWaveAt || activeEnemies > 0) return false;
    this.wave++;
    spawn(this.wave, Math.min(2 + this.wave, 7));
    this.nextWaveAt = time + 8000;
    return false;
  }
}

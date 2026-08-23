import { WaveDefinition } from '@td-nya/shared';

export class WaveSystem {
  public wave = 0;
  public readonly maxWaves = 5;
  private nextWaveAt = 5000;

  update(time: number, activeEnemies: number, waves: WaveDefinition[], spawn: (wave: WaveDefinition) => void) {
    if (this.wave >= this.maxWaves) return activeEnemies === 0;
    if (time < this.nextWaveAt || activeEnemies > 0) return false;
    this.wave++;
    const wave = waves[this.wave - 1];
    if (wave) spawn(wave);
    this.nextWaveAt = time + 8000;
    return false;
  }
}

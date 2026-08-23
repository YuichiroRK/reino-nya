import { WaveDefinition } from '@td-nya/shared';
import { Waves } from './enemies';

export interface LevelDefinition {
  id: string;
  name: string;
  description: string;
  waves: WaveDefinition[];
}

export const Levels: Record<string, LevelDefinition> = {
  level1: {
    id: 'level1',
    name: 'Nivel 1 · Primer asedio',
    description: 'Aprende a defender las tres joyas durante cinco oleadas.',
    waves: Waves,
  },
};

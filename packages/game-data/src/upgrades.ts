import { UpgradeNode, UpgradePathId } from '@td-nya/shared';

export const UpgradePaths: Record<UpgradePathId, UpgradeNode[]> = {
  damage: [
    { id: 'damage-1', name: 'Garra afilada', description: '+20% daño de ataques.', cost: 100, effect: { attackPercent: 0.2 } },
    { id: 'damage-2', name: 'Poder del Nya', description: '+15% poder de habilidades.', cost: 180, effect: { attackPercent: 0.2, skillPower: 0.15 } },
    { id: 'damage-3', name: 'Golpe devastador', description: '+30% daño y +20% poder de habilidades.', cost: 300, effect: { attackPercent: 0.3, skillPower: 0.2 } },
  ],
  range: [
    { id: 'range-1', name: 'Vista amplia', description: '+25 alcance.', cost: 90, effect: { range: 25 } },
    { id: 'range-2', name: 'Dominio del campo', description: '+35 alcance.', cost: 170, effect: { range: 35 } },
    { id: 'range-3', name: 'Alcance absoluto', description: '+55 alcance y +10% poder de habilidades.', cost: 280, effect: { range: 55, skillPower: 0.1 } },
  ],
  speed: [
    { id: 'speed-1', name: 'Ritmo ligero', description: '+12% velocidad de ataque.', cost: 100, effect: { speedPercent: 0.12 } },
    { id: 'speed-2', name: 'Cadencia feroz', description: '+18% velocidad de ataque.', cost: 180, effect: { speedPercent: 0.18 } },
    { id: 'speed-3', name: 'Fuego rápido', description: '+25% velocidad y +10% poder de habilidades.', cost: 300, effect: { speedPercent: 0.25, skillPower: 0.1 } },
  ],
  piercing: [
    { id: 'piercing-1', name: 'Punta perforante', description: 'El ataque alcanza 1 enemigo adicional.', cost: 120, effect: { piercing: 1 } },
    { id: 'piercing-2', name: 'Virote atravesante', description: 'El ataque alcanza 2 enemigos adicionales.', cost: 220, effect: { piercing: 2 } },
    { id: 'piercing-3', name: 'Línea de destrucción', description: 'El ataque alcanza 3 enemigos adicionales.', cost: 360, effect: { piercing: 3 } },
  ],
};

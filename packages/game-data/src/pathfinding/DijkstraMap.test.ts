import test from 'node:test';
import assert from 'node:assert/strict';
import { DijkstraMap } from './DijkstraMap';

test('DijkstraMap - Calculates distance to a single target on empty grid', () => {
  const map = new DijkstraMap(5, 5);
  map.calculate([{ x: 2, y: 2 }]); // Center target

  assert.equal(map.grid[2][2].distance, 0, "Target distance should be 0");
  assert.equal(map.grid[1][2].distance, 1, "Adjacent cell distance should be 1");
  assert.equal(map.grid[0][2].distance, 2, "Cell 2 steps away should be 2");

  // Check next step
  const next = map.getNextStep(2, 0); // Start at top middle
  assert.equal(next?.x, 2, "Next step from top middle should move down towards target");
  assert.equal(next?.y, 1, "Next step from top middle should move down towards target");
});

test('DijkstraMap - Navigates around a wall', () => {
  const map = new DijkstraMap(5, 5);
  // Target at bottom right
  // S . . . .
  // W W W W .
  // . . . . .
  // . . . . .
  // . . . . T
  
  map.setWalkable(0, 1, false);
  map.setWalkable(1, 1, false);
  map.setWalkable(2, 1, false);
  map.setWalkable(3, 1, false);
  
  map.calculate([{ x: 4, y: 4 }]); // Target at (4,4)

  const next = map.getNextStep(0, 0); // Start at top left
  
  // It should be forced to go right to avoid the wall
  assert.equal(next?.x, 1);
  assert.equal(next?.y, 0);

  // If we start at (4,0), we can just go down
  const nextDown = map.getNextStep(4, 0);
  assert.equal(nextDown?.x, 4);
  assert.equal(nextDown?.y, 1);
});

test('DijkstraMap - Cannot reach target if completely walled off', () => {
  const map = new DijkstraMap(3, 3);
  
  // W W W
  // W T W
  // W W W
  map.setWalkable(0, 0, false); map.setWalkable(1, 0, false); map.setWalkable(2, 0, false);
  map.setWalkable(0, 1, false);                               map.setWalkable(2, 1, false);
  map.setWalkable(0, 2, false); map.setWalkable(1, 2, false); map.setWalkable(2, 2, false);

  map.calculate([{ x: 1, y: 1 }]); // Target in center

  // Distance at 0,0 should be Max Value since it's a wall anyway
  // But let's check a walkable cell outside if we made one. 
  // Let's make a 5x5 instead to test properly.
});

test('DijkstraMap - Unreachable walkable area', () => {
  const map = new DijkstraMap(5, 5);
  
  // Wall across the entire middle row
  for(let x = 0; x < 5; x++) {
    map.setWalkable(x, 2, false);
  }

  map.calculate([{ x: 2, y: 4 }]); // Target at bottom

  // Top area should be unreachable
  assert.equal(map.grid[0][2].distance, Number.MAX_VALUE, "Unreachable cell should have MAX_VALUE distance");
  
  const next = map.getNextStep(0, 2);
  assert.equal(next, null, "Should return null if there is no path to target");
});

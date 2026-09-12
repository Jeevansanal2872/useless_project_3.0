// map.js
// Top-down house layouts. Each level is a grid of tiles ('#' wall, '.' floor).
// We convert the grid into a list of AABB wall rectangles once, at load time,
// so the collision system never has to touch strings during gameplay.

import { TILE_SIZE } from './config.js';

// Legend: '#' wall, '.' floor, 'P' player spawn, 'R' rat spawn.
// Every layout is bordered by walls (the house itself).

const EASY_LAYOUT = [
  '####################',
  '#P.................#',
  '#..........#####...#',
  '#..........#...#...#',
  '#..###.....#...#...#',
  '#..#.......#####...#',
  '#..#................#',
  '#..#........###.....#',
  '#............#.....R#',
  '#............#......#',
  '####################',
];

const MEDIUM_LAYOUT = [
  '##########################',
  '#P...........#...........#',
  '#....#####...#....####...#',
  '#....#...#...#....#..#...#',
  '#....#...#...#....#..#...#',
  '#....#####........####...#',
  '#..........#####.........#',
  '#....######.....#####....#',
  '#....#.................#.#',
  '#....#.....#####.......#.#',
  '#..........#...#.........#',
  '#....#######...#####.....#',
  '#..............#...#....R#',
  '##########################',
];

const HARD_LAYOUT = [
  '############################',
  '#P.....#..........#........#',
  '#.###..#..######...#..###..#',
  '#.#.#..#..#....#...#..#.#..#',
  '#.#.#.....#....#...#..#.#..#',
  '#.#.####..#....#####..#.#..#',
  '#.#........................#',
  '#.#..#####.....#####..#####.',
  '#.#..#...#.....#...#..#....#',
  '#....#...#.....#...#..#....#',
  '#....#####.....#####..#....#',
  '#............#.............#',
  '#..#######...#....#####....#',
  '#..#.....#...#....#...#...R#',
  '#..#.....#........#...#....#',
  '############################',
];

const LAYOUTS = {
  easy: EASY_LAYOUT,
  medium: MEDIUM_LAYOUT,
  hard: HARD_LAYOUT,
};

/**
 * Parses an ASCII layout into wall rectangles + spawn points + world bounds.
 * @param {string[]} layout
 */
function buildMap(layout) {
  const walls = [];
  let playerSpawn = { x: TILE_SIZE * 1.5, y: TILE_SIZE * 1.5 };
  let ratSpawn = { x: TILE_SIZE * 3.5, y: TILE_SIZE * 3.5 };

  layout.forEach((row, rowIndex) => {
    for (let col = 0; col < row.length; col++) {
      const ch = row[col];
      const x = col * TILE_SIZE;
      const y = rowIndex * TILE_SIZE;
      if (ch === '#') {
        walls.push({ x, y, width: TILE_SIZE, height: TILE_SIZE });
      } else if (ch === 'P') {
        playerSpawn = { x: x + TILE_SIZE / 2, y: y + TILE_SIZE / 2 };
      } else if (ch === 'R') {
        ratSpawn = { x: x + TILE_SIZE / 2, y: y + TILE_SIZE / 2 };
      }
    }
  });

  const width = Math.max(...layout.map((row) => row.length)) * TILE_SIZE;
  const height = layout.length * TILE_SIZE;

  return { walls, playerSpawn, ratSpawn, width, height };
}

const MAP_CACHE = {};

/** Returns (and memoizes) the parsed map data for a level id. */
export function getMap(levelId) {
  if (!MAP_CACHE[levelId]) {
    const layout = LAYOUTS[levelId];
    if (!layout) throw new Error(`Unknown level id: ${levelId}`);
    MAP_CACHE[levelId] = buildMap(layout);
  }
  return MAP_CACHE[levelId];
}

// All hitboxes are in the SVG's native coordinate space: 1440 x 1024
// The SVG viewBox is "0 0 1440 1024"
// The game maps player/rat coordinates to this same space (GAME_WIDTH=1440, GAME_HEIGHT=1024)
// Walls prevent movement through solid structures; door gaps are intentional openings.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string; // optional for debug display
}

// ─── EASY MAP ──────────────────────────────────────────────────────────────────
// House-Easy.svg: outer house footprint starts around x=4, y=59 and ends around x=1444, y=1069
// The playable interior is inside the outer wall. We block the outer walls as thick rects.
// Interior walls divide rooms. Door openings are 80-100px wide gaps in the walls.
// Furniture is approximated from the SVG visual layout.

const easyHitboxes: Rect[] = [
  // ── Outer boundary walls ─────────────────────────────────
  { x: 0,    y: 0,    w: 1440, h: 60,   label: 'top-boundary' },
  { x: 0,    y: 964,  w: 1440, h: 60,   label: 'bottom-boundary' },
  { x: 0,    y: 0,    w: 10,   h: 1024, label: 'left-boundary' },
  { x: 1430, y: 0,    w: 10,   h: 1024, label: 'right-boundary' },

  // ── Outer house walls (thick) ─────────────────────────────
  // Top wall of house structure
  { x: 60,  y: 59,  w: 1320, h: 28,   label: 'house-top-wall' },
  // Bottom wall of house
  { x: 60,  y: 975, w: 1320, h: 25,   label: 'house-bottom-wall' },
  // Left wall of house
  { x: 60,  y: 59,  w: 28,   h: 920,  label: 'house-left-wall' },
  // Right wall of house
  { x: 1352, y: 59, w: 28,   h: 920,  label: 'house-right-wall' },

  // ── Interior walls — horizontal ───────────────────────────
  // Mid horizontal wall separating top rooms from bottom rooms
  // Wall from left to door opening (~x=420), then resumes (~x=540) to right
  { x: 88,  y: 490, w: 332,  h: 22,   label: 'mid-h-wall-left' },
  { x: 540, y: 490, w: 812,  h: 22,   label: 'mid-h-wall-right' },

  // Upper horizontal divider (separating bedroom from hallway)
  { x: 88,  y: 290, w: 560,  h: 20,   label: 'upper-h-wall-left' },
  { x: 760, y: 290, w: 592,  h: 20,   label: 'upper-h-wall-right' },

  // ── Interior walls — vertical ─────────────────────────────
  // Left vertical room divider
  { x: 450, y: 87,  w: 22,   h: 203,  label: 'v-wall-top-left' },
  { x: 450, y: 380, w: 22,   h: 110,  label: 'v-wall-top-left-lower' },

  // Center vertical divider (between left hall and center room)
  { x: 720, y: 87,  w: 22,   h: 203,  label: 'v-wall-center-top' },
  { x: 720, y: 380, w: 22,   h: 110,  label: 'v-wall-center-lower' },

  // Right vertical divider
  { x: 1000, y: 87, w: 22,   h: 200,  label: 'v-wall-right-top' },
  { x: 1000, y: 380,w: 22,   h: 110,  label: 'v-wall-right-lower' },

  // ── Furniture — Living Room (bottom-left area) ────────────
  { x: 100, y: 600, w: 180,  h: 120,  label: 'sofa' },
  { x: 180, y: 540, w: 80,   h: 60,   label: 'coffee-table' },

  // ── Furniture — Kitchen (bottom-right area) ───────────────
  { x: 1100, y: 520, w: 240, h: 60,   label: 'kitchen-counter-top' },
  { x: 1340, y: 520, w: 12,  h: 440,  label: 'kitchen-counter-right' },
  { x: 1100, y: 520, w: 12,  h: 440,  label: 'kitchen-counter-left' },
  { x: 1100, y: 840, w: 240, h: 60,   label: 'kitchen-counter-bottom' },

  // ── Furniture — Bedroom top-left ──────────────────────────
  { x: 100,  y: 100, w: 200, h: 140,  label: 'bed-left' },
  { x: 88,   y: 240, w: 70,  h: 50,   label: 'nightstand-left' },

  // ── Furniture — Study/office top-center ───────────────────
  { x: 560,  y: 110, w: 130, h: 80,   label: 'desk' },
  { x: 660,  y: 110, w: 50,  h: 60,   label: 'desk-chair' },

  // ── Furniture — Bedroom top-right ─────────────────────────
  { x: 1060, y: 100, w: 260, h: 150,  label: 'bed-right' },
  { x: 1300, y: 100, w: 50,  h: 50,   label: 'nightstand-right' },

  // ── Furniture — Bathroom (bottom center) ──────────────────
  { x: 550,  y: 600, w: 100, h: 80,   label: 'bathtub' },
  { x: 650,  y: 580, w: 60,  h: 40,   label: 'sink' },
  { x: 680,  y: 640, w: 50,  h: 60,   label: 'toilet' },
];

// ─── MEDIUM MAP ────────────────────────────────────────────────────────────────
const mediumHitboxes: Rect[] = [
  // Outer boundary
  { x: 0,    y: 0,    w: 1440, h: 60,   label: 'top-boundary' },
  { x: 0,    y: 964,  w: 1440, h: 60,   label: 'bottom-boundary' },
  { x: 0,    y: 0,    w: 10,   h: 1024, label: 'left-boundary' },
  { x: 1430, y: 0,    w: 10,   h: 1024, label: 'right-boundary' },

  // House walls
  { x: 60,  y: 59,  w: 1320, h: 28,   label: 'house-top-wall' },
  { x: 60,  y: 975, w: 1320, h: 25,   label: 'house-bottom-wall' },
  { x: 60,  y: 59,  w: 28,   h: 920,  label: 'house-left-wall' },
  { x: 1352,y: 59,  w: 28,   h: 920,  label: 'house-right-wall' },

  // Interior walls - more complex layout
  { x: 88,  y: 400, w: 280,  h: 20,   label: 'mid-left-h-wall' },
  { x: 460, y: 400, w: 520,  h: 20,   label: 'mid-center-h-wall' },
  { x: 1080,y: 400, w: 272,  h: 20,   label: 'mid-right-h-wall' },

  { x: 88,  y: 650, w: 220,  h: 20,   label: 'lower-left-h-wall' },
  { x: 400, y: 650, w: 640,  h: 20,   label: 'lower-center-h-wall' },
  { x: 1140,y: 650, w: 212,  h: 20,   label: 'lower-right-h-wall' },

  { x: 380, y: 87,  w: 20,   h: 313,  label: 'v-wall-left' },
  { x: 700, y: 87,  w: 20,   h: 313,  label: 'v-wall-center' },
  { x: 1000,y: 87,  w: 20,   h: 313,  label: 'v-wall-right' },

  { x: 380, y: 420, w: 20,   h: 230,  label: 'v-wall-left-mid' },
  { x: 700, y: 420, w: 20,   h: 230,  label: 'v-wall-center-mid' },
  { x: 1000,y: 420, w: 20,   h: 230,  label: 'v-wall-right-mid' },

  // Furniture
  { x: 100, y: 500, w: 180, h: 100,   label: 'sofa' },
  { x: 100, y: 100, w: 240, h: 160,   label: 'bed' },
  { x: 880, y: 100, w: 100, h: 80,    label: 'desk' },
  { x: 1100,y: 460, w: 240, h: 180,   label: 'kitchen-counter' },
  { x: 500, y: 460, w: 160, h: 80,    label: 'table' },
  { x: 200, y: 700, w: 100, h: 80,    label: 'bathtub' },
];

// ─── HARD MAP ──────────────────────────────────────────────────────────────────
const hardHitboxes: Rect[] = [
  // Outer boundary
  { x: 0,    y: 0,    w: 1440, h: 60,   label: 'top-boundary' },
  { x: 0,    y: 964,  w: 1440, h: 60,   label: 'bottom-boundary' },
  { x: 0,    y: 0,    w: 10,   h: 1024, label: 'left-boundary' },
  { x: 1430, y: 0,    w: 10,   h: 1024, label: 'right-boundary' },

  // House walls
  { x: 60,  y: 59,  w: 1320, h: 28,   label: 'house-top-wall' },
  { x: 60,  y: 975, w: 1320, h: 25,   label: 'house-bottom-wall' },
  { x: 60,  y: 59,  w: 28,   h: 920,  label: 'house-left-wall' },
  { x: 1352,y: 59,  w: 28,   h: 920,  label: 'house-right-wall' },

  // Dense interior layout
  { x: 88,  y: 320, w: 220,  h: 20,   label: 'h-wall-1' },
  { x: 400, y: 320, w: 320,  h: 20,   label: 'h-wall-2' },
  { x: 820, y: 320, w: 380,  h: 20,   label: 'h-wall-3' },
  { x: 1300,y: 320, w: 52,   h: 20,   label: 'h-wall-4' },

  { x: 88,  y: 540, w: 180,  h: 20,   label: 'h-wall-5' },
  { x: 360, y: 540, w: 440,  h: 20,   label: 'h-wall-6' },
  { x: 900, y: 540, w: 452,  h: 20,   label: 'h-wall-7' },

  { x: 88,  y: 760, w: 260,  h: 20,   label: 'h-wall-8' },
  { x: 440, y: 760, w: 360,  h: 20,   label: 'h-wall-9' },
  { x: 900, y: 760, w: 452,  h: 20,   label: 'h-wall-10' },

  { x: 320, y: 87,  w: 20,   h: 233,  label: 'v-wall-1' },
  { x: 600, y: 87,  w: 20,   h: 233,  label: 'v-wall-2' },
  { x: 900, y: 87,  w: 20,   h: 233,  label: 'v-wall-3' },
  { x: 1200,y: 87,  w: 20,   h: 233,  label: 'v-wall-4' },

  { x: 320, y: 340, w: 20,   h: 200,  label: 'v-wall-5' },
  { x: 600, y: 340, w: 20,   h: 200,  label: 'v-wall-6' },
  { x: 900, y: 340, w: 20,   h: 200,  label: 'v-wall-7' },
  { x: 1200,y: 340, w: 20,   h: 200,  label: 'v-wall-8' },

  { x: 320, y: 560, w: 20,   h: 200,  label: 'v-wall-9' },
  { x: 600, y: 560, w: 20,   h: 200,  label: 'v-wall-10' },
  { x: 900, y: 560, w: 20,   h: 200,  label: 'v-wall-11' },
  { x: 1200,y: 560, w: 20,   h: 200,  label: 'v-wall-12' },

  // Furniture
  { x: 100, y: 100, w: 180, h: 120,   label: 'bed-1' },
  { x: 420, y: 100, w: 130, h: 90,    label: 'desk-1' },
  { x: 650, y: 100, w: 210, h: 130,   label: 'bed-2' },
  { x: 960, y: 100, w: 200, h: 140,   label: 'bed-3' },
  { x: 1240,y: 100, w: 100, h: 100,   label: 'wardrobe' },
  { x: 100, y: 370, w: 190, h: 90,    label: 'sofa' },
  { x: 420, y: 370, w: 130, h: 80,    label: 'table-1' },
  { x: 650, y: 370, w: 200, h: 100,   label: 'table-2' },
  { x: 1240,y: 370, w: 110, h: 90,    label: 'kitchen-appliance' },
  { x: 100, y: 600, w: 180, h: 80,    label: 'bathtub' },
  { x: 660, y: 600, w: 200, h: 150,   label: 'table-3' },
  { x: 960, y: 590, w: 200, h: 150,   label: 'kitchen-counter' },
  { x: 1240,y: 600, w: 100, h: 100,   label: 'appliance-2' },
  { x: 100, y: 800, w: 190, h: 150,   label: 'furniture-lower' },
  { x: 960, y: 790, w: 200, h: 150,   label: 'bookshelf' },
];

export const houseMapHitboxes: Record<'easy' | 'medium' | 'hard', Rect[]> = {
  easy: easyHitboxes,
  medium: mediumHitboxes,
  hard: hardHitboxes,
};

// The game's logical coordinate space matches the SVG viewBox
export const GAME_WIDTH = 1440;
export const GAME_HEIGHT = 1024;

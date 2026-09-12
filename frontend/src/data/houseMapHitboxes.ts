// All hitboxes are derived directly from the designer's hitmap SVGs.
// Coordinate space: 1440 x 1024 (matches the SVG viewBox "0 0 1440 1024").
// Red rectangles (fill="#E40A0A") in the hitmap = collision zones.
//
// For each SVG <rect x="X" y="Y" width="W" height="H" transform="rotate(A X Y)">
// the AXIS-ALIGNED bounding box is computed analytically and stored here.
// Rotated rects at 0° / 180° → same bbox. At 90° / -90° the W↔H swap around the pivot.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

// ─── EASY MAP ──────────────────────────────────────────────────────────────────
// Source: Easy-hitmap.svg  (1440×1024, all rects fill="#E40A0A")
const easyHitboxes: Rect[] = [
  // ── Screen / canvas boundary (keep player inside) ─────────────────────
  { x: 0,    y: 0,    w: 1440, h: 40,   label: 'top-screen' },
  { x: 0,    y: 984,  w: 1440, h: 40,   label: 'bottom-screen' },
  { x: 0,    y: 0,    w: 10,   h: 1024, label: 'left-screen' },
  { x: 1430, y: 0,    w: 10,   h: 1024, label: 'right-screen' },

  // ── Top outer wall  (x=136.5 y=75.5 w=653 h=34) ──────────────────────
  { x: 137, y: 76,  w: 653, h: 34, label: 'top-wall-left' },
  // (x=905.5 y=75.5 w=502 h=34)
  { x: 906, y: 76,  w: 502, h: 34, label: 'top-wall-right' },

  // ── Right outer wall  rotate(90 1424.5 75.5) w=502 h=34
  //   pivot=(1424.5,75.5), after 90° CW: x=1424.5-34=1390, y=75.5, w=34, h=502
  { x: 1390, y: 76,  w: 34,  h: 502, label: 'right-outer-wall-top' },

  // ── Right vertical section  rotate(90 1379.5 196.5) w=228 h=62
  //   x=1379.5-62=1317, y=196.5, w=62, h=228
  { x: 1317, y: 197, w: 62,  h: 228, label: 'right-wall-mid' },

  // ── rotate(180 1401.5 180.5) w=228 h=70  (180° = same bbox, pivoted)
  //   x=1401.5-228=1173, y=180.5-70=110, w=228, h=70
  { x: 1173, y: 111, w: 228, h: 70,  label: 'inner-top-right-wall' },

  // ── rotate(-90 981.5 302.5) w=100 h=70 → x=981.5, y=302.5-100=202, w=70, h=100
  { x: 982,  y: 202, w: 70,  h: 100, label: 'center-vert-wall' },

  // ── rotate(-90 1229.5 429.5) w=86 h=70 → x=1229.5, y=429.5-86=343, w=70, h=86
  { x: 1230, y: 343, w: 70,  h: 86,  label: 'right-lower-vert-wall' },

  // ── Right hall lower  rotate(90 1328.5 578.5) w=391 h=99 → x=1328.5-99=1229, y=578, w=99, h=391
  { x: 1229, y: 579, w: 99,  h: 391, label: 'right-hall-wall' },

  // ── Bottom wall segment  rotate(180 1228.5 969.5) w=400 h=99 → x=828, y=870, w=400, h=99
  { x: 828,  y: 870, w: 400, h: 99,  label: 'bottom-right-wall' },

  // ── Small vertical near center-bottom  rotate(-90 828.5 969.5) w=152 h=23 → x=828, y=817, w=23, h=152
  { x: 828,  y: 817, w: 23,  h: 152, label: 'bottom-center-vert' },

  // ── Horizontal segment  x=805.5 y=946.5 w=152 h=23
  { x: 806,  y: 947, w: 152, h: 23,  label: 'bottom-mid-horiz' },

  // ── Bottom-left wall  x=141.5 y=946.5 w=552 h=23
  { x: 142,  y: 947, w: 552, h: 23,  label: 'bottom-left-wall' },

  // ── Left outer wall  rotate(90 169.5 566.5) w=391 h=28 → x=169.5-28=141, y=566, w=28, h=391
  { x: 141,  y: 566, w: 28,  h: 391, label: 'left-outer-wall' },

  // ── Right hall top vert  rotate(90 986.5 92.5) w=361 h=28 → x=986-28=958, y=92, w=28, h=361
  { x: 958,  y: 92,  w: 28,  h: 361, label: 'center-right-vert-wall' },

  // ── rotate(180 1424.5 453.5) w=319 h=28 → x=1105, y=425, w=319, h=28
  { x: 1105, y: 425, w: 319, h: 28,  label: 'upper-right-horiz-wall' },

  // ── rotate(180 1008.5 453.5) w=43 h=28 → x=965, y=425, w=43, h=28
  { x: 965,  y: 425, w: 43,  h: 28,  label: 'upper-center-stub' },

  // ── rotate(180 1144.5 582.5) w=25 h=28 → x=1119, y=554, w=25, h=28
  { x: 1119, y: 554, w: 25,  h: 28,  label: 'center-stub-2' },

  // ── Furniture rects (axis-aligned, 180° identical) ───────────────────
  // rotate(180 1070.5 733.5) w=40 h=48 → x=1030, y=685, w=40, h=48
  { x: 1030, y: 685, w: 40,  h: 48,  label: 'furniture-1' },
  // rotate(180 994.5 816.5) w=53 h=48 → x=941, y=768, w=53, h=48
  { x: 941,  y: 768, w: 53,  h: 48,  label: 'furniture-2' },
  // rotate(180 920.5 736.5) w=53 h=48 → x=867, y=688, w=53, h=48
  { x: 867,  y: 688, w: 53,  h: 48,  label: 'furniture-3' },
  // rotate(180 996.5 655.5) w=53 h=48 → x=943, y=607, w=53, h=48
  { x: 943,  y: 607, w: 53,  h: 48,  label: 'furniture-4' },

  // ── x=1119.5 y=578.5 w=290 h=22
  { x: 1120, y: 579, w: 290, h: 22,  label: 'kitchen-counter-top' },

  // ── Left outer top  rotate(90 169.5 74.5) w=361 h=28 → x=141, y=74, w=28, h=361
  { x: 141,  y: 74,  w: 28,  h: 361, label: 'left-outer-wall-top' },

  // ── rotate(90 758.5 75.5) w=251 h=28 → x=730, y=75, w=28, h=251
  { x: 730,  y: 75,  w: 28,  h: 251, label: 'center-top-vert-wall' },

  // ── rotate(90 729.5 138.5) w=162 h=46 → x=683, y=138, w=46, h=162
  { x: 683,  y: 138, w: 46,  h: 162, label: 'inner-vert-left' },

  // ── rotate(90 278.5 585.5) w=255 h=93 → x=185, y=585, w=93, h=255
  { x: 185,  y: 585, w: 93,  h: 255, label: 'left-inner-room-wall' },

  // ── rotate(180 510.5 934.5) w=196 h=41 → x=314, y=893, w=196, h=41
  { x: 314,  y: 893, w: 196, h: 41,  label: 'left-bottom-horiz' },

  // ── Left mid wall segment  x=136.5 y=419.5 w=383 h=34
  { x: 137,  y: 419, w: 383, h: 34,  label: 'left-mid-horiz-wall' },

  // ── Angled furniture approximations (bounding boxes) ─────────────────
  // rotate(85.2635 422.121 523.793) w=78 h=93 → approx bbox
  { x: 376,  y: 476, w: 93,  h: 93,  label: 'angled-furniture-1' },
  // rotate(89.1016 495.92 451.508) w=20 h=166 → vert-ish, approx
  { x: 479,  y: 364, w: 20,  h: 176, label: 'thin-vert-wall-1' },
  // rotate(89.1016 752.945 433.962) w=20 h=137 → vert-ish
  { x: 746,  y: 365, w: 20,  h: 147, label: 'thin-vert-wall-2' },
  // rotate(134.826 610.334 627.816) w=78 h=93 → approx
  { x: 564,  y: 581, w: 93,  h: 93,  label: 'angled-furniture-2' },

  // ── Ellipse zones (tables/obstacles) ─────────────────────────────────
  // cx=969.5 cy=708.5 rx=63.5 ry=65.5
  { x: 906,  y: 643, w: 127, h: 131, label: 'round-table-1' },
  // cx=405.5 cy=734.5 rx=63.5 ry=65.5
  { x: 342,  y: 669, w: 127, h: 131, label: 'round-table-2' },
];

// ─── MEDIUM MAP ────────────────────────────────────────────────────────────────
// Source: Medium - hitmap.svg
const mediumHitboxes: Rect[] = [
  // Screen boundary
  { x: 0,    y: 0,    w: 1440, h: 40,   label: 'top-screen' },
  { x: 0,    y: 984,  w: 1440, h: 40,   label: 'bottom-screen' },
  { x: 0,    y: 0,    w: 10,   h: 1024, label: 'left-screen' },
  { x: 1430, y: 0,    w: 10,   h: 1024, label: 'right-screen' },

  // rotate(90 286.5 121.5) w=298 h=28 → x=258, y=121, w=28, h=298
  { x: 258,  y: 121, w: 28,  h: 298, label: 'left-outer-wall' },
  // rotate(90 1277.5 121.5) w=298 h=28 → x=1249, y=121, w=28, h=298
  { x: 1249, y: 121, w: 28,  h: 298, label: 'right-outer-wall' },
  // rotate(90 1234.5 363.5) w=298 h=17 → x=1217, y=363, w=17, h=298
  { x: 1217, y: 363, w: 17,  h: 298, label: 'right-inner-vert' },

  // rotate(180 1294.5 661.5) w=298 h=15 → x=996, y=646, w=298, h=15
  { x: 996,  y: 646, w: 298, h: 15,  label: 'right-mid-horiz-wall' },
  // rotate(180 1294.5 661.5) w=77 h=22 → x=1217, y=639, w=77, h=22
  { x: 1217, y: 639, w: 77,  h: 22,  label: 'right-mid-stub' },

  // rotate(-90 1290.5 941.5) w=302 h=22 → x=1290, y=639, w=22, h=302
  { x: 1290, y: 639, w: 22,  h: 302, label: 'right-lower-vert' },

  // x=244.5 y=925.5 w=1068 h=22 (bottom wall)
  { x: 244,  y: 925, w: 1068, h: 22, label: 'bottom-main-wall' },

  // rotate(90 272.5 641.5) w=298 h=28 → x=244, y=641, w=28, h=298
  { x: 244,  y: 641, w: 28,  h: 298, label: 'left-lower-vert' },

  // rotate(90 334.5 400.5) w=260 h=28 → x=306, y=400, w=28, h=260
  { x: 306,  y: 400, w: 28,  h: 260, label: 'left-upper-vert' },

  // rotate(180 1277.5 145.5) w=1019 h=24 → x=258, y=121, w=1019, h=24 (top wall)
  { x: 258,  y: 121, w: 1019, h: 24, label: 'top-main-wall' },

  // rotate(180 623.5 414.5) w=365 h=16 → x=258, y=398, w=365, h=16
  { x: 258,  y: 398, w: 365, h: 16,  label: 'inner-mid-horiz-left' },
  // rotate(180 609.5 658.5) w=365 h=16 → x=244, y=642, w=365, h=16
  { x: 244,  y: 642, w: 365, h: 16,  label: 'inner-lower-horiz-left' },

  // rotate(180 853.5 740.5) w=253 h=16 → x=600, y=724, w=253, h=16
  { x: 600,  y: 724, w: 253, h: 16,  label: 'inner-mid-horiz-center' },

  // rotate(180 817.5 414.5) w=114 h=16 → x=703, y=398, w=114, h=16
  { x: 703,  y: 398, w: 114, h: 16,  label: 'inner-mid-stub' },

  // Furniture / interior obstacles
  // rotate(180 809.5 329.5) w=93 h=10 → x=716, y=319, w=93, h=10
  { x: 716,  y: 319, w: 93,  h: 10,  label: 'thin-wall-1' },
  // rotate(180 920.5 329.5) w=56 h=10 → x=864, y=319, w=56, h=10
  { x: 864,  y: 319, w: 56,  h: 10,  label: 'thin-wall-2' },
  // rotate(180 657.5 329.5) w=56 h=10 → x=601, y=319, w=56, h=10
  { x: 601,  y: 319, w: 56,  h: 10,  label: 'thin-wall-3' },

  // rotate(-90 605.5 323.5) w=202 h=10 → x=605, y=121, w=10, h=202
  { x: 605,  y: 121, w: 10,  h: 202, label: 'thin-vert-wall-1' },
  // rotate(90 762.5 121.5) w=202 h=10 → x=752, y=121, w=10, h=202
  { x: 752,  y: 121, w: 10,  h: 202, label: 'thin-vert-wall-2' },
  // rotate(90 920.5 121.5) w=202 h=10 → x=910, y=121, w=10, h=202
  { x: 910,  y: 121, w: 10,  h: 202, label: 'thin-vert-wall-3' },

  // Furniture blocks
  // rotate(90 964.5 133.5) w=160 h=43 → x=921, y=133, w=43, h=160
  { x: 921,  y: 133, w: 43,  h: 160, label: 'furniture-desk-1' },
  // rotate(90 907.5 142.5) w=118 h=43 → x=864, y=142, w=43, h=118
  { x: 864,  y: 142, w: 43,  h: 118, label: 'furniture-desk-2' },
  // rotate(90 806.5 214.5) w=106 h=43 → x=763, y=214, w=43, h=106
  { x: 763,  y: 214, w: 43,  h: 106, label: 'furniture-3' },
  // rotate(90 659.5 254.5) w=64 h=43 → x=616, y=254, w=43, h=64
  { x: 616,  y: 254, w: 43,  h: 64,  label: 'furniture-4' },
  // rotate(90 600.5 146.5) w=158 h=43 → x=557, y=146, w=43, h=158
  { x: 557,  y: 146, w: 43,  h: 158, label: 'furniture-shelf' },
  // rotate(90 480.5 139.5) w=158 h=115 → x=365, y=139, w=115, h=158
  { x: 365,  y: 139, w: 115, h: 158, label: 'furniture-cabinet' },

  // Smaller furniture
  // rotate(90 360.5 149.5) w=34 h=35 → x=325, y=149, w=35, h=34
  { x: 325,  y: 149, w: 35,  h: 34,  label: 'small-furniture-1' },
  // rotate(90 347.5 328.5) w=34 h=35 → x=312, y=328, w=35, h=34
  { x: 312,  y: 328, w: 35,  h: 34,  label: 'small-furniture-2' },

  // rotate(90 391.5 477.5) w=111 h=59 → x=332, y=477, w=59, h=111
  { x: 332,  y: 477, w: 59,  h: 111, label: 'sofa' },
  // rotate(90 604.5 493.5) w=60 h=59 → x=545, y=493, w=59, h=60
  { x: 545,  y: 493, w: 59,  h: 60,  label: 'chair-1' },
  // rotate(90 510.5 498.5) w=60 h=95 → x=415, y=498, w=95, h=60
  { x: 415,  y: 498, w: 95,  h: 60,  label: 'table-center' },

  // More furniture
  // rotate(90 758.5 748.5) w=52 h=52 → x=706, y=748, w=52, h=52
  { x: 706,  y: 748, w: 52,  h: 52,  label: 'furniture-a' },
  // rotate(90 806.5 741.5) w=59 h=37 → x=769, y=741, w=37, h=59
  { x: 769,  y: 741, w: 37,  h: 59,  label: 'furniture-b' },
  // rotate(90 912.5 860.5) w=59 h=143 → x=769, y=860, w=143, h=59
  { x: 769,  y: 860, w: 143, h: 59,  label: 'furniture-c' },
  // rotate(90 822.5 816.5) w=34 h=53 → x=769, y=816, w=53, h=34
  { x: 769,  y: 816, w: 53,  h: 34,  label: 'furniture-d' },
  // rotate(90 758.5 865.5) w=44 h=52 → x=706, y=865, w=52, h=44
  { x: 706,  y: 865, w: 52,  h: 44,  label: 'furniture-e' },
  // rotate(90 758.5 809.5) w=49 h=57 → x=701, y=809, w=57, h=49
  { x: 701,  y: 809, w: 57,  h: 49,  label: 'furniture-f' },

  // Large furniture at bottom
  // rotate(90 529.5 873.5) w=49 h=256 → x=273, y=873, w=256, h=49
  { x: 273,  y: 873, w: 256, h: 49,  label: 'long-counter' },
  // rotate(90 437.5 661.5) w=49 h=174 → x=263, y=661, w=174, h=49
  { x: 263,  y: 661, w: 174, h: 49,  label: 'kitchen-left' },
  // rotate(180 320.5 880.5) w=49 h=210 → x=71, y=670, w=49, h=210  (approx)
  { x: 271,  y: 831, w: 210, h: 49,  label: 'bottom-counter' },
  // rotate(90 599.5 859.5) w=65 h=64 → x=535, y=859, w=64, h=65
  { x: 535,  y: 859, w: 64,  h: 65,  label: 'bathroom-fixture' },

  // Various wall stubs
  // rotate(90 510.5 622.5) w=27 h=108 → x=402, y=622, w=108, h=27
  { x: 402,  y: 622, w: 108, h: 27,  label: 'wall-stub-1' },
  // rotate(90 809.5 463.5) w=163 h=81 → x=728, y=463, w=81, h=163
  { x: 728,  y: 463, w: 81,  h: 163, label: 'right-room-wall' },

  // rotate(180 540.5 469.5) w=155 h=54 → x=385, y=415, w=155, h=54
  { x: 385,  y: 415, w: 155, h: 54,  label: 'inner-block-1' },
  // rotate(180 1162.5 469.5) w=155 h=54 → x=1007, y=415, w=155, h=54
  { x: 1007, y: 415, w: 155, h: 54,  label: 'right-block-1' },
  // rotate(180 1128.5 553.5) w=90 h=54 → x=1038, y=499, w=90, h=54
  { x: 1038, y: 499, w: 90,  h: 54,  label: 'right-block-2' },
  // rotate(180 1140.5 655.5) w=116 h=36 → x=1024, y=619, w=116, h=36
  { x: 1024, y: 619, w: 116, h: 36,  label: 'right-shelf-1' },
  // rotate(180 1165.5 686.5) w=116 h=36 → x=1049, y=650, w=116, h=36
  { x: 1049, y: 650, w: 116, h: 36,  label: 'right-shelf-2' },

  // rotate(-90 928.5 863.5) w=111 h=36 → x=928, y=752, w=36, h=111
  { x: 928,  y: 752, w: 36,  h: 111, label: 'right-vert-stub-1' },
  // rotate(-90 1249.5 779.5) w=123 h=45 → x=1249, y=656, w=45, h=123
  { x: 1249, y: 656, w: 45,  h: 123, label: 'right-vert-stub-2' },
  // rotate(-90 1244.5 947.5) w=119 h=45 → x=1244, y=828, w=45, h=119
  { x: 1244, y: 828, w: 45,  h: 119, label: 'right-vert-stub-3' },
  // rotate(-90 1221.5 897.5) w=43 h=45 → x=1221, y=854, w=45, h=43
  { x: 1221, y: 854, w: 45,  h: 43,  label: 'right-vert-stub-4' },
  // rotate(-90 1049.5 919.5) w=139 h=116 → x=1049, y=780, w=116, h=139
  { x: 1049, y: 780, w: 116, h: 139, label: 'right-corner-block' },

  // rotate(90 922.5 718.5) w=207 h=9 → x=913, y=718, w=9, h=207
  { x: 913,  y: 718, w: 9,   h: 207, label: 'thin-vert-mid' },
  // rotate(-90 759.5 939.5) w=207 h=9 → x=759, y=732, w=9, h=207
  { x: 759,  y: 732, w: 9,   h: 207, label: 'thin-vert-right' },
  // rotate(-90 600.5 939.5) w=133 h=9 → x=600, y=806, w=9, h=133
  { x: 600,  y: 806, w: 9,   h: 133, label: 'thin-vert-left' },

  // rotate(180 991.5 526.5) w=52 h=54 → x=939, y=472, w=52, h=54
  { x: 939,  y: 472, w: 52,  h: 54,  label: 'obstacle-1' },

  // Extra small furniture
  // rotate(90 520.5 146.5) w=34 h=35 → x=485, y=146, w=35, h=34
  { x: 485,  y: 146, w: 35,  h: 34,  label: 'small-obj-1' },
  // rotate(90 367.5 363.5) w=34 h=89 → x=278, y=363, w=89, h=34
  { x: 278,  y: 363, w: 89,  h: 34,  label: 'small-obj-2' },
  // rotate(90 480.5 369.5) w=28 h=102 → x=378, y=369, w=102, h=28
  { x: 378,  y: 369, w: 102, h: 28,  label: 'small-obj-3' },
  // rotate(90 1139.5 371.5) w=28 h=110 → x=1029, y=371, w=110, h=28
  { x: 1029, y: 371, w: 110, h: 28,  label: 'right-stub-h' },
  // rotate(90 746.5 218.5) w=35 h=43 → x=703, y=218, w=43, h=35
  { x: 703,  y: 218, w: 43,  h: 35,  label: 'small-obj-4' },
  // rotate(90 751.5 146.5) w=52 h=137 → x=614, y=146, w=137, h=52
  { x: 614,  y: 146, w: 137, h: 52,  label: 'large-cabinet' },

  // rotate(180 1263.5 406.5) w=365 h=16 → x=898, y=390, w=365, h=16
  { x: 898,  y: 390, w: 365, h: 16,  label: 'top-right-horiz-wall' },
];

// ─── HARD MAP ──────────────────────────────────────────────────────────────────
// Source: Hard-hitmap.svg
const hardHitboxes: Rect[] = [
  // Screen boundary
  { x: 0,    y: 0,    w: 1440, h: 40,   label: 'top-screen' },
  { x: 0,    y: 984,  w: 1440, h: 40,   label: 'bottom-screen' },
  { x: 0,    y: 0,    w: 10,   h: 1024, label: 'left-screen' },
  { x: 1430, y: 0,    w: 10,   h: 1024, label: 'right-screen' },

  // Outer walls
  // rotate(90 283.5 107.5) w=321 h=24 → x=259, y=107, w=24, h=321
  { x: 259,  y: 107, w: 24,  h: 321, label: 'left-outer-wall' },
  // rotate(90 1273.5 110.5) w=306 h=24 → x=1249, y=110, w=24, h=306
  { x: 1249, y: 110, w: 24,  h: 306, label: 'right-outer-wall' },
  // rotate(180 1261.5 415.5) w=220 h=24 → x=1041, y=391, w=220, h=24
  { x: 1041, y: 391, w: 220, h: 24,  label: 'right-mid-horiz' },

  // x=1036.5 y=363.5 w=104 h=24
  { x: 1036, y: 363, w: 104, h: 24,  label: 'inner-wall-1' },
  // x=1157.5 y=350.5 w=104 h=39
  { x: 1157, y: 350, w: 104, h: 39,  label: 'inner-wall-2' },
  // x=1179.5 y=317.5 w=44 h=39
  { x: 1179, y: 317, w: 44,  h: 39,  label: 'inner-wall-3' },
  // x=1223.5 y=297.5 w=25 h=24
  { x: 1223, y: 297, w: 25,  h: 24,  label: 'inner-wall-4' },
  // x=1100.5 y=175.5 w=148 h=117
  { x: 1100, y: 175, w: 148, h: 117, label: 'large-block-right' },

  // rotate(90 1064.5 640.5) w=296 h=24 → x=1040, y=640, w=24, h=296
  { x: 1040, y: 640, w: 24,  h: 296, label: 'right-lower-vert' },
  // rotate(180 1064.5 937.5) w=337 h=24 → x=727, y=913, w=337, h=24
  { x: 727,  y: 913, w: 337, h: 24,  label: 'bottom-right-horiz' },
  // x=247.5 y=913.5 w=397 h=24
  { x: 247,  y: 913, w: 397, h: 24,  label: 'bottom-left-horiz' },
  // rotate(180 1273.5 134.5) w=1014 h=24 → x=259, y=110, w=1014, h=24 (top wall)
  { x: 259,  y: 110, w: 1014, h: 24, label: 'top-main-wall' },

  // rotate(180 456.5 649.5) w=209 h=17 → x=247, y=632, w=209, h=17
  { x: 247,  y: 632, w: 209, h: 17,  label: 'inner-horiz-left' },

  // rotate(-90 247.5 922.5) w=296 h=22 → x=247, y=626, w=22, h=296
  { x: 247,  y: 626, w: 22,  h: 296, label: 'left-lower-vert' },

  // Angled/diagonal wall segments (bounding boxes approximated)
  // rotate(-90 280.5 840.5) w=48 h=43 → x=280, y=792, w=43, h=48
  { x: 280,  y: 792, w: 43,  h: 48,  label: 'wall-bump-1' },

  // rotate(-43.6489 271.707 750.836) w=42 h=43 → approx bbox
  { x: 240,  y: 720, w: 65,  h: 65,  label: 'diagonal-wall-1' },
  // rotate(45.1809 301.173 848.641) w=42 h=43 → approx bbox
  { x: 270,  y: 818, w: 65,  h: 65,  label: 'diagonal-wall-2' },
  // rotate(45.1809 382.209 851.707) w=42 h=43 → approx bbox
  { x: 351,  y: 821, w: 65,  h: 65,  label: 'diagonal-wall-3' },
  // rotate(45.1809 896.209 493.707) w=60 h=59 → approx bbox
  { x: 853,  y: 451, w: 90,  h: 90,  label: 'diagonal-obstacle-1' },

  // Rectangular furniture (axis-aligned)
  // x=865.5 y=687.5 w=129 h=50
  { x: 865,  y: 687, w: 129, h: 50,  label: 'furniture-a' },
  // x=827.5 y=856.5 w=150 h=50
  { x: 827,  y: 856, w: 150, h: 50,  label: 'furniture-b' },
  // x=854.5 y=771.5 w=89 h=50
  { x: 854,  y: 771, w: 89,  h: 50,  label: 'furniture-c' },
  // x=688.5 y=354.5 w=98 h=48
  { x: 688,  y: 354, w: 98,  h: 48,  label: 'center-obstacle' },

  // More diagonal approximations
  // rotate(-43.3142 775.707 431.925) w=63 h=35 → approx bbox
  { x: 735,  y: 405, w: 75,  h: 75,  label: 'diagonal-obstacle-2' },
  // rotate(-90.7185 288.653 309.47) w=63 h=34 → near-vertical
  { x: 271,  y: 275, w: 34,  h: 63,  label: 'vert-wall-stub-1' },
  // rotate(-90.7185 435.296 185.93) w=63 h=34 → near-vertical
  { x: 418,  y: 151, w: 34,  h: 63,  label: 'vert-wall-stub-2' },
  // rotate(-90.7185 263.019 423.851) w=40 h=62
  { x: 246,  y: 389, w: 62,  h: 40,  label: 'horiz-wall-stub' },
  // rotate(-90.7185 491.296 170.93) w=63 h=86
  { x: 448,  y: 106, w: 86,  h: 63,  label: 'upper-block-1' },
  // rotate(-90.7185 281.296 191.93) w=63 h=128
  { x: 217,  y: 128, w: 128, h: 63,  label: 'upper-block-2' },

  // Diagonal cuts at angles (approximated bounding boxes)
  // rotate(-45.5688 856.785 337.795) w=61 h=139 → approx
  { x: 808,  y: 279, w: 111, h: 155, label: 'diagonal-wall-main' },

  // Large rectangular blocks
  // x=747.5 y=175.5 w=159 h=117
  { x: 747,  y: 175, w: 159, h: 117, label: 'large-center-block' },
  // x=897.5 y=127.5 w=48 h=165
  { x: 897,  y: 127, w: 48,  h: 165, label: 'right-tall-block' },
  // x=897.5 y=127.5 w=132 h=42
  { x: 897,  y: 127, w: 132, h: 42,  label: 'right-wide-block' },
  // x=897.5 y=283.5 w=132 h=9
  { x: 897,  y: 283, w: 132, h: 9,   label: 'thin-floor-line' },

  // Diagonal obstacles approximated
  // rotate(-43 750.707 437.73) w=206 h=9 → large diagonal wall
  { x: 603,  y: 290, w: 250, h: 20,  label: 'long-diagonal-1' },
  // rotate(0.731198 632.818 391.675) w=193 h=9 → nearly flat
  { x: 632,  y: 391, w: 193, h: 9,   label: 'horiz-wall-thin' },
  // rotate(-44.5238 433.707 640.868) w=229 h=9
  { x: 271,  y: 478, w: 230, h: 20,  label: 'long-diagonal-2' },
  // rotate(-45.4084 187.707 495.415) w=162 h=21 → diagonal
  { x: 102,  y: 380, w: 130, h: 130, label: 'diagonal-area-1' },
  // rotate(45.1103 202.692 480.707) w=210 h=21 → diagonal
  { x: 110,  y: 388, w: 130, h: 130, label: 'diagonal-area-2' },

  // Small wall stubs
  // rotate(0.731198 526.621 281.506) w=90 h=9
  { x: 526,  y: 281, w: 90,  h: 9,   label: 'thin-stub-1' },

  // Diagonal thin walls
  // rotate(42.7685 527.599 278.781) w=55 h=11 → approx
  { x: 499,  y: 254, w: 70,  h: 50,  label: 'diag-thin-1' },
  // rotate(2.69135 720.069 627.523) w=41 h=11 → nearly horiz
  { x: 720,  y: 627, w: 41,  h: 11,  label: 'thin-flat-1' },

  // Complex diagonal furniture
  // rotate(46.7264 345.471 369.011) w=147 h=112 → large diagonal block
  { x: 247,  y: 267, w: 185, h: 185, label: 'large-angled-block' },

  // Additional small furniture/obstacles
  // x=982.675 y=841.692 w=129 h=50 rx=8.5 (rounded rect but treat as rect)
  { x: 932,  y: 791, w: 129, h: 50,  label: 'rounded-furniture' },

  // Large diagonal columns
  // rotate(45.1809 998.681 390.76) w=51 h=160 → approx
  { x: 930,  y: 332, w: 130, h: 130, label: 'diagonal-col-1' },
  // rotate(135.181 1212.16 503.036) w=63 h=160 → approx
  { x: 1110, y: 390, w: 130, h: 130, label: 'diagonal-col-2' },
  // rotate(92.1571 1128.01 396.299) w=50 h=129 → near-horiz
  { x: 1063, y: 371, w: 129, h: 50,  label: 'near-horiz-wall' },
  // rotate(45.1809 1190.7 484.148) w=65 h=263 → large diagonal
  { x: 1005, y: 296, w: 230, h: 230, label: 'large-diagonal-right' },

  // Vertical walls at right edge
  // rotate(90 732.5 699.5) w=236 h=12 → x=720, y=699, w=12, h=236
  { x: 720,  y: 699, w: 12,  h: 236, label: 'lower-vert-1' },
  // rotate(90 762.5 730.5) w=117 h=29 → x=733, y=730, w=29, h=117
  { x: 733,  y: 730, w: 29,  h: 117, label: 'lower-vert-2' },
  // rotate(89.802 614.217 792.48) w=144 h=12 → near-vert
  { x: 608,  y: 720, w: 12,  h: 144, label: 'lower-vert-3' },

  // Irregular polygon areas (path elements — approximate as rects)
  // M977.5 736.5 ... → approx bbox x=977 y=684 w=54 h=59
  { x: 977,  y: 684, w: 54,  h: 59,  label: 'path-obstacle-1' },
  // M399.5 770 L361.5 731 ... → approx bbox x=359 y=716 w=94 h=54
  { x: 359,  y: 716, w: 94,  h: 54,  label: 'path-obstacle-2' },
  // M479.656 843.522 ... → approx bbox x=479 y=787 w=63 h=62
  { x: 479,  y: 787, w: 63,  h: 63,  label: 'path-obstacle-3' },

  // Ellipse obstacle  cx=617 cy=669.5 rx=48 ry=46.5
  { x: 569,  y: 623, w: 96,  h: 93,  label: 'round-obstacle' },
];

export const houseMapHitboxes: Record<'easy' | 'medium' | 'hard', Rect[]> = {
  easy:   easyHitboxes,
  medium: mediumHitboxes,
  hard:   hardHitboxes,
};

// The game's logical coordinate space matches the SVG viewBox
export const GAME_WIDTH  = 1440;
export const GAME_HEIGHT = 1024;

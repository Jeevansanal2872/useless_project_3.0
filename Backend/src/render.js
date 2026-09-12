// render.js
// Deliberately dumb top-down renderer for backend testing purposes only —
// the real UI/UX pass belongs to whoever builds the actual front end.
// Takes a GameEngine snapshot and draws it onto a 2D canvas context.

const COLORS = {
  floor: '#2b2620',
  wall: '#5a4632',
  wallEdge: '#3a2d1e',
  player: '#f2c744',
  playerTorch: '#ff8c42',
  ratAlive: '#c9c9c9',
  ratFlee: '#ff6b6b',
  fireCore: '#ff5722',
  fireGlow: 'rgba(255, 87, 34, 0.35)',
  stunRing: 'rgba(255, 255, 255, 0.6)',
};

export function render(ctx, snapshot) {
  // Extract 'rats' array instead of a single 'rat'
  const { map, player, rats, fires } = snapshot;
  
  ctx.save();
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, map.width, map.height);

  for (const wall of map.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    ctx.strokeStyle = COLORS.wallEdge;
    ctx.lineWidth = 1;
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.width - 1, wall.height - 1);
  }

  for (const fire of fires) {
    drawFire(ctx, fire);
  }

  // Iterate over all active rats and draw them
  for (const rat of rats) {
    drawRat(ctx, rat);
  }

  drawPlayer(ctx, player);

  ctx.restore();
}

function drawFire(ctx, fire) {
  const radius = 8 + fire.intensity * 26;
  const grad = ctx.createRadialGradient(fire.x, fire.y, 2, fire.x, fire.y, radius * 1.8);
  grad.addColorStop(0, COLORS.fireCore);
  grad.addColorStop(1, 'rgba(255,87,34,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(fire.x, fire.y, radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.fireCore;
  ctx.beginPath();
  ctx.arc(fire.x, fire.y, radius * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawRat(ctx, rat) {
  if (!rat.alive) return;
  const cx = rat.x + rat.width / 2;
  const cy = rat.y + rat.height / 2;
  ctx.fillStyle = rat.state === 'FLEE' ? COLORS.ratFlee : COLORS.ratAlive;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rat.width / 2, rat.height / 2.4, rat.facingAngle, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx, player) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(player.facingAngle);

  // Body
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
  ctx.fill();

  // Torch, sticking out in the facing direction
  ctx.strokeStyle = COLORS.playerTorch;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(player.width / 2, 0);
  ctx.lineTo(player.width / 2 + 18, 0);
  ctx.stroke();
  ctx.fillStyle = COLORS.playerTorch;
  ctx.beginPath();
  ctx.arc(player.width / 2 + 18, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (player.isStunned) {
    ctx.save();
    ctx.strokeStyle = COLORS.stunRing;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, player.width / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

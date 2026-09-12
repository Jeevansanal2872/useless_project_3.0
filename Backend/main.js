// main.js
// Thin glue between GameEngine (the actual "backend") and a throwaway
// canvas UI, purely so the engine can be exercised interactively. A real
// front end would replace everything in this file and keep src/* as-is.

import { GameEngine, GameState } from './src/gameEngine.js';
import { render } from './src/render.js';
import { InputController } from './src/inputController.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const overlayBanner = document.getElementById('overlayBanner');

const hudPoints = document.getElementById('hudPoints');
const hudRatStatus = document.getElementById('hudRatStatus');
const hudPowerup = document.getElementById('hudPowerup');
const hudPlayerStatus = document.getElementById('hudPlayerStatus');
const hudFireList = document.getElementById('hudFireList');

const taskModal = document.getElementById('taskModal');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskCode = document.getElementById('taskCode');
const taskHint = document.getElementById('taskHint');
const taskResults = document.getElementById('taskResults');
const taskRunBtn = document.getElementById('taskRunBtn');
const taskHintBtn = document.getElementById('taskHintBtn');
const taskPauseBtn = document.getElementById('taskPauseBtn');
const taskDegradedBadge = document.getElementById('taskDegradedBadge');

const input = new InputController();
input.attach();

let engine = null;
let lastFrameTime = null;
let modalOpenForFireId = null;

document.getElementById('levelSelect').addEventListener('click', (e) => {
  const level = e.target?.dataset?.level;
  if (!level) return;
  document
    .querySelectorAll('#levelSelect button')
    .forEach((b) => b.classList.toggle('active', b.dataset.level === level));
  startLevel(level);
});

function startLevel(levelId) {
  engine = new GameEngine(levelId);
  canvas.width = engine.map.width;
  canvas.height = engine.map.height;
  overlayBanner.classList.add('hidden');
  closeModalUI();
  lastFrameTime = null;
}

function closeModalUI() {
  taskModal.classList.add('hidden');
  taskHint.classList.add('hidden');
  taskResults.innerHTML = '';
  modalOpenForFireId = null;
}

function openModalUI(activeTask) {
  const { fire, task } = activeTask;
  modalOpenForFireId = fire.id;
  taskTitle.textContent = task.title;
  taskDescription.textContent = task.description;
  taskCode.value = fire.workingCode ?? task.buggyCode;
  taskHint.textContent = task.hint;
  taskHint.classList.add('hidden');
  taskResults.innerHTML = '';
  taskModal.classList.remove('hidden');
}

taskRunBtn.addEventListener('click', async () => {
  if (!engine) return;
  taskRunBtn.disabled = true;
  taskRunBtn.textContent = 'Running…';
  const outcome = await engine.submitTaskSolution(taskCode.value);
  taskRunBtn.disabled = false;
  taskRunBtn.textContent = 'Run tests';
  renderTaskOutcome(outcome);
  if (outcome.ok) {
    setTimeout(closeModalUI, 700); // brief beat to see the green results
  }
});

taskHintBtn.addEventListener('click', () => {
  taskHint.classList.toggle('hidden');
});

taskPauseBtn.addEventListener('click', () => {
  engine?.pauseTask();
  closeModalUI();
});

function renderTaskOutcome(outcome) {
  taskDegradedBadge.classList.toggle('hidden', !outcome.degraded);
  taskResults.innerHTML = '';
  if (outcome.error && (!outcome.results || outcome.results.length === 0)) {
    const div = document.createElement('div');
    div.className = 'case fail';
    div.textContent = outcome.error;
    taskResults.appendChild(div);
    return;
  }
  for (const r of outcome.results) {
    const div = document.createElement('div');
    div.className = `case ${r.pass ? 'pass' : 'fail'}`;
    const inputStr = JSON.stringify(r.input);
    if (r.pass) {
      div.textContent = `✔ ${inputStr} → ${JSON.stringify(r.expected)}`;
    } else if (r.error) {
      div.textContent = `✘ ${inputStr} → error: ${r.error}`;
    } else {
      div.textContent = `✘ ${inputStr} → got ${JSON.stringify(r.got)}, expected ${JSON.stringify(r.expected)}`;
    }
    taskResults.appendChild(div);
  }
}

function updateHud(snapshot) {
  hudPoints.textContent = String(snapshot.score.points);
  hudRatStatus.textContent = `${snapshot.rats.length} alive`;
  hudPowerup.textContent = snapshot.currentPowerup ?? 'none';
  hudPlayerStatus.textContent = snapshot.player.isStunned
    ? `stunned (${snapshot.player.stunTimer.toFixed(1)}s)`
    : 'active';

  hudFireList.innerHTML = '';
  if (snapshot.fires.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'none';
    hudFireList.appendChild(li);
  }
  for (const fire of snapshot.fires) {
    const li = document.createElement('li');
    const remaining = Math.max(0, 300 - fire.elapsed);
    li.innerHTML = `<span>#${fire.id}</span><span>${remaining.toFixed(0)}s left</span>`;
    hudFireList.appendChild(li);
  }

  if (snapshot.state === GameState.WON) {
    overlayBanner.textContent = `House saved! Final score: ${snapshot.score.points}`;
    overlayBanner.className = 'overlay-banner win';
  } else if (snapshot.state === GameState.LOST) {
    overlayBanner.textContent = `The house burned down. Final score: ${snapshot.score.points}`;
    overlayBanner.className = 'overlay-banner lose';
  } else {
    overlayBanner.classList.add('hidden');
  }
}

function frame(timestamp) {
  requestAnimationFrame(frame);
  if (!engine) return;

  if (lastFrameTime == null) lastFrameTime = timestamp;
  const dt = Math.min(0.05, (timestamp - lastFrameTime) / 1000); // clamp to avoid huge jumps
  lastFrameTime = timestamp;

  if (!engine.isGameOver) {
    if (engine.state === GameState.PLAYING) {
      if (input.consumeAction('attack')) engine.attemptAttack();
      if (input.consumeAction('interact')) {
        const opened = engine.attemptInteract();
        if (opened) openModalUI(engine.getActiveTask());
      }
    } else if (engine.state === GameState.TASK_ACTIVE) {
      if (input.consumeAction('pauseTask')) {
        engine.pauseTask();
        closeModalUI();
      }
    }
    engine.update(dt, input.getMoveVector());
  }

  input.endFrame();

  render(ctx, engine.getSnapshot());
  updateHud(engine.getSnapshot());
}

requestAnimationFrame(frame);

// Auto-start on Easy so the harness is immediately playable.
document.querySelector('#levelSelect button[data-level="easy"]').click();

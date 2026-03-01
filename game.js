const storyPanel = document.getElementById('story-panel');
const gamePanel = document.getElementById('game-panel');
const storyText = document.getElementById('story-text');
const storyNextBtn = document.getElementById('story-next');
const missionTitle = document.getElementById('mission-title');
const missionGoal = document.getElementById('mission-goal');
const turnCountEl = document.getElementById('turn-count');
const phaseEl = document.getElementById('phase');
const mapSvg = document.getElementById('map');
const provinceInfo = document.getElementById('province-info');
const targetSelect = document.getElementById('target-select');
const attackBtn = document.getElementById('attack-btn');
const endTurnBtn = document.getElementById('end-turn-btn');
const logEl = document.getElementById('combat-log');
const nextMissionBtn = document.getElementById('next-mission-btn');

const UNIT_TEMPLATES = {
  ground: { hp: 100, org: 100, atk: 32, def: 20, symbol: 'G' },
  air: { hp: 70, org: 80, atk: 18, def: 10, symbol: 'A' },
  naval: { hp: 90, org: 90, atk: 22, def: 14, symbol: 'N' }
};

const state = {
  storyIndex: 0,
  story: [],
  missions: [],
  featuresById: {},
  missionIndex: 0,
  selected: null,
  phase: 'NATO',
  turn: 1,
  control: {},
  units: {},
  currentMission: null
};

init();

async function init() {
  const [geoRes, missionRes] = await Promise.all([
    fetch('data/act1_map.geojson'),
    fetch('data/missions.json')
  ]);

  const geo = await geoRes.json();
  const missionData = await missionRes.json();

  geo.features.forEach((feature) => {
    state.featuresById[feature.properties.id] = feature;
  });

  state.story = missionData.story;
  state.missions = missionData.missions;

  storyText.textContent = state.story[state.storyIndex];
  storyNextBtn.addEventListener('click', onNextStory);
  attackBtn.addEventListener('click', handleAttack);
  endTurnBtn.addEventListener('click', endTurn);
  nextMissionBtn.addEventListener('click', nextMission);
}

function onNextStory() {
  state.storyIndex += 1;
  if (state.storyIndex >= state.story.length) {
    storyPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    loadMission(0);
    return;
  }
  storyText.textContent = state.story[state.storyIndex];
}

function loadMission(index) {
  const mission = state.missions[index];
  state.missionIndex = index;
  state.currentMission = mission;
  state.selected = null;
  state.phase = 'NATO';
  state.turn = 1;
  state.control = {};
  state.units = {};
  nextMissionBtn.classList.add('hidden');

  mission.playerControlled.forEach((id) => {
    state.control[id] = 'nato';
    state.units[id] = createProvinceUnits('nato', id);
  });

  mission.enemyControlled.forEach((id) => {
    state.control[id] = 'enemy';
    state.units[id] = createProvinceUnits('enemy', id);
  });

  mission.neutral.forEach((id) => {
    state.control[id] = 'neutral';
    state.units[id] = [];
  });

  missionTitle.textContent = mission.name;
  missionGoal.textContent = mission.goal;
  turnCountEl.textContent = state.turn;
  phaseEl.textContent = state.phase;

  renderMap();
  renderProvinceInfo(null);
  logEl.innerHTML = '';
  log(`Mission started: ${mission.name}`);
}

function createProvinceUnits(side, provinceId) {
  const terrain = state.featuresById[provinceId]?.properties?.terrain || 'plains';
  const ground = { ...UNIT_TEMPLATES.ground, type: 'ground' };
  const air = { ...UNIT_TEMPLATES.air, type: 'air' };
  const naval = { ...UNIT_TEMPLATES.naval, type: 'naval' };

  if (terrain === 'coastal') return [ground, naval, air];
  if (terrain === 'mountain') {
    ground.org += 10;
    return [ground, air];
  }
  if (terrain === 'desert') {
    ground.atk += 4;
  }

  if (side === 'enemy') {
    ground.org -= 12;
    air.org -= 5;
  }

  return [ground, air];
}

function renderMap() {
  mapSvg.innerHTML = '';

  const mission = state.currentMission;
  const relevant = Object.keys(mission.adjacency)
    .map((id) => state.featuresById[id])
    .filter(Boolean);

  if (!relevant.length) return;

  const projected = relevant.map((f) => ({
    id: f.properties.id,
    points: f.geometry.coordinates[0].map(projectPoint)
  }));

  const bounds = getBounds(projected.flatMap((f) => f.points));
  const scale = Math.min(940 / bounds.width, 520 / bounds.height);

  projected.forEach((feature) => {
    const pathData = feature.points
      .map((pt) => [
        (pt.x - bounds.minX) * scale + 30,
        (pt.y - bounds.minY) * scale + 30
      ])
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ') + ' Z';

    const provincePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    provincePath.setAttribute('d', pathData);
    provincePath.classList.add('province', state.control[feature.id] || 'neutral');
    provincePath.dataset.provinceId = feature.id;

    if (state.selected === feature.id) {
      provincePath.classList.add('selected');
    }

    provincePath.addEventListener('click', () => {
      state.selected = feature.id;
      renderMap();
      renderProvinceInfo(feature.id);
      buildTargetOptions(feature.id);
    });

    mapSvg.appendChild(provincePath);

    const [cx, cy] = centroidFromPath(pathData);
    renderUnitSymbol(feature.id, cx, cy);
  });
}

function renderUnitSymbol(provinceId, cx, cy) {
  const side = state.control[provinceId];
  const units = state.units[provinceId] || [];
  if (!units.length || side === 'neutral') return;

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.classList.add('nato-symbol');

  const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  box.setAttribute('x', (cx - 20).toString());
  box.setAttribute('y', (cy - 12).toString());
  box.setAttribute('width', '40');
  box.setAttribute('height', '24');
  box.classList.add('unit-box', side);
  group.appendChild(box);

  const summary = units.map((u) => u.symbol).join('');
  const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  txt.setAttribute('x', cx.toString());
  txt.setAttribute('y', (cy + 4).toString());
  txt.setAttribute('text-anchor', 'middle');
  txt.classList.add('unit-label');
  txt.textContent = summary;
  group.appendChild(txt);

  mapSvg.appendChild(group);
}

function buildTargetOptions(provinceId) {
  targetSelect.innerHTML = '';
  const side = state.control[provinceId];
  if (state.phase !== 'NATO' || side !== 'nato') return;

  const neighbors = state.currentMission.adjacency[provinceId] || [];
  const hostile = neighbors.filter((n) => state.control[n] === 'enemy');
  hostile.forEach((n) => {
    const option = document.createElement('option');
    option.value = n;
    option.textContent = state.featuresById[n]?.properties?.name || n;
    targetSelect.appendChild(option);
  });
}

function renderProvinceInfo(provinceId) {
  if (!provinceId) {
    provinceInfo.textContent = 'Select a province to inspect forces.';
    return;
  }

  const feature = state.featuresById[provinceId];
  const units = state.units[provinceId] || [];
  const side = state.control[provinceId] || 'neutral';

  const unitText = units.length
    ? units.map((u) => `${u.type.toUpperCase()} HP:${Math.max(0, Math.round(u.hp))} ORG:${Math.max(0, Math.round(u.org))}`).join('<br>')
    : 'No stationed units';

  provinceInfo.innerHTML = `
    <strong>${feature.properties.name}</strong><br>
    Nation: ${feature.properties.nation}<br>
    Terrain: ${feature.properties.terrain}<br>
    Control: ${side.toUpperCase()}<br><br>
    ${unitText}
  `;
}

function handleAttack() {
  if (state.phase !== 'NATO') {
    log('Wait for NATO phase to issue attacks.');
    return;
  }

  const from = state.selected;
  const to = targetSelect.value;
  if (!from || !to) {
    log('Select a NATO province and valid enemy target.');
    return;
  }

  resolveBattle(from, to, 'nato');
  renderMap();
  renderProvinceInfo(from);
  checkVictory();
}

function resolveBattle(fromId, toId, attackerSide) {
  const defenderSide = attackerSide === 'nato' ? 'enemy' : 'nato';
  const attackerUnits = state.units[fromId] || [];
  const defenderUnits = state.units[toId] || [];

  if (!attackerUnits.length || !defenderUnits.length) {
    log('No units available for this battle.');
    return;
  }

  const terrain = state.featuresById[toId].properties.terrain;
  let attackPower = attackerUnits.reduce((sum, unit) => {
    let bonus = 1;
    if (unit.type === 'ground' && (terrain === 'plains' || terrain === 'desert')) bonus += 0.3;
    if (unit.type === 'air') bonus += 0.15;
    if (unit.type === 'naval' && terrain === 'coastal') bonus += 0.25;
    return sum + unit.atk * bonus * (unit.org / 100);
  }, 0);

  const defensePower = defenderUnits.reduce((sum, unit) => sum + unit.def * (unit.org / 100), 0);

  const ratio = attackPower / Math.max(1, defensePower);
  const inflicted = 20 * ratio;
  const retaliate = 14 / Math.max(1, ratio);

  defenderUnits.forEach((unit) => {
    unit.hp -= inflicted;
    unit.org -= inflicted * 0.8;
  });

  attackerUnits.forEach((unit) => {
    unit.hp -= retaliate;
    unit.org -= retaliate * 0.5;
  });

  state.units[toId] = defenderUnits.filter((u) => u.hp > 0 && u.org > 0);
  state.units[fromId] = attackerUnits.filter((u) => u.hp > 0 && u.org > 0);

  if (!state.units[toId].length) {
    state.control[toId] = attackerSide;
    state.units[toId] = state.units[fromId].map((u) => ({ ...u, org: Math.max(20, u.org - 12) }));
    log(`Breakthrough! ${state.featuresById[toId].properties.name} captured by ${attackerSide.toUpperCase()}.`);

    if (terrain === 'plains' || terrain === 'desert') {
      log('Blitzkrieg momentum gained: armored columns can press onward next turn.');
    }
  } else {
    log(`${state.featuresById[fromId].properties.name} attacked ${state.featuresById[toId].properties.name}: ratio ${ratio.toFixed(2)}.`);
  }
}

function endTurn() {
  if (state.phase === 'NATO') {
    state.phase = 'ENEMY';
    enemyTurn();
    state.phase = 'NATO';
    state.turn += 1;
    applyEncirclementEffects();
  }

  turnCountEl.textContent = state.turn;
  phaseEl.textContent = state.phase;
  renderMap();
  if (state.selected) {
    renderProvinceInfo(state.selected);
    buildTargetOptions(state.selected);
  }
  checkVictory();
}

function enemyTurn() {
  const mission = state.currentMission;
  const enemyProvinces = Object.keys(state.control).filter((p) => state.control[p] === 'enemy');

  enemyProvinces.forEach((province) => {
    const neighbors = mission.adjacency[province] || [];
    const targets = neighbors.filter((n) => state.control[n] === 'nato');
    if (!targets.length) return;

    const target = targets[Math.floor(Math.random() * targets.length)];
    resolveBattle(province, target, 'enemy');
  });

  log('Enemy phase complete.');
}

function applyEncirclementEffects() {
  const isolated = findIsolatedEnemyProvinces();
  isolated.forEach((pid) => {
    (state.units[pid] || []).forEach((unit) => {
      unit.org -= 20;
      unit.hp -= 5;
    });
    state.units[pid] = (state.units[pid] || []).filter((u) => u.hp > 0 && u.org > 0);
    log(`Encirclement: ${state.featuresById[pid].properties.name} is cut off (-20 ORG).`);
    if (!state.units[pid].length) {
      state.control[pid] = 'neutral';
      log(`${state.featuresById[pid].properties.name} collapsed from isolation.`);
    }
  });
}

function findIsolatedEnemyProvinces() {
  const mission = state.currentMission;
  const enemyCapital = mission.capitalBySide.enemy;
  if (!enemyCapital || state.control[enemyCapital] !== 'enemy') {
    return Object.keys(state.control).filter((p) => state.control[p] === 'enemy');
  }

  const visited = new Set([enemyCapital]);
  const queue = [enemyCapital];

  while (queue.length) {
    const current = queue.shift();
    const neighbors = mission.adjacency[current] || [];
    neighbors.forEach((n) => {
      if (!visited.has(n) && state.control[n] === 'enemy') {
        visited.add(n);
        queue.push(n);
      }
    });
  }

  return Object.keys(state.control).filter((p) => state.control[p] === 'enemy' && !visited.has(p));
}

function checkVictory() {
  const objectivesHeld = state.currentMission.objectives.every((obj) => state.control[obj] === 'nato');
  const anyEnemy = Object.values(state.control).some((side) => side === 'enemy');

  if (objectivesHeld || !anyEnemy) {
    log(`Mission complete: ${state.currentMission.name}`);
    nextMissionBtn.classList.remove('hidden');
    attackBtn.disabled = true;
    endTurnBtn.disabled = true;

    if (state.missionIndex === state.missions.length - 1) {
      missionGoal.textContent = 'Act 1 complete. Iran divided, Kurdish regions liberated, NATO ports secured. Suspicious coalition emerges...';
      nextMissionBtn.textContent = 'Act 1 Ends';
      nextMissionBtn.disabled = true;
    }
  }
}

function nextMission() {
  attackBtn.disabled = false;
  endTurnBtn.disabled = false;
  const next = state.missionIndex + 1;
  if (next < state.missions.length) {
    loadMission(next);
  }
}

function log(message) {
  const p = document.createElement('p');
  p.textContent = `T${state.turn}: ${message}`;
  logEl.prepend(p);
}

function projectPoint([lon, lat]) {
  return { x: lon + 180, y: 90 - lat };
}

function getBounds(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
}

function centroidFromPath(pathData) {
  const points = pathData
    .replace(/M|L|Z/g, '')
    .trim()
    .split(/\s+/)
    .reduce((arr, v, i, src) => {
      if (i % 2 === 0) arr.push([Number(v), Number(src[i + 1])]);
      return arr;
    }, []);

  const valid = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const count = valid.length || 1;
  const sum = valid.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / count, sum[1] / count];
}

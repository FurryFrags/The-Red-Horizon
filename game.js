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
const toggleGroupBtn = document.getElementById('toggle-group-btn');
const logEl = document.getElementById('combat-log');
const nextMissionBtn = document.getElementById('next-mission-btn');

const COUNTRY_BOUNDARY_CATALOG = {
  POL: 'Poland',
  IRN: 'Iran',
  TUR: 'Turkey',
  AFG: 'Afghanistan',
  CHN: 'China',
  IRQ: 'Iraq',
  PRK: 'North Korea',
  USA: 'United States'
};

const PROVINCE_CATALOG = {
  pl_warsaw: { iso: 'POL', names: ['Mazowieckie', 'Masovian'], terrain: 'plains' },
  pl_lublin: { iso: 'POL', names: ['Lubelskie', 'Lublin'], terrain: 'plains' },
  tr_van: { iso: 'TUR', names: ['Van'], terrain: 'mountain' },
  tr_ankara: { iso: 'TUR', names: ['Ankara'], terrain: 'plains' },
  ir_urmia: { iso: 'IRN', names: ['West Azerbaijan', 'Āz̄arbāyjān-e Gharbī'], terrain: 'mountain' },
  ir_tabriz: { iso: 'IRN', names: ['East Azerbaijan', 'Āz̄arbāyjān-e Sharqī'], terrain: 'mountain' },
  ir_kermanshah: { iso: 'IRN', names: ['Kermanshah', 'Kermānshāh'], terrain: 'hills' },
  ir_tehran: { iso: 'IRN', names: ['Tehran', 'Tehrān'], terrain: 'plains' },
  ir_isfahan: { iso: 'IRN', names: ['Isfahan', 'Esfahan', 'Eşfahān'], terrain: 'plains' },
  ir_mashhad: { iso: 'IRN', names: ['Razavi Khorasan', 'Khorasan-e Razavi'], terrain: 'desert' },
  ir_chabahar: { iso: 'IRN', names: ['Sistan and Baluchestan', 'Sīstān va Balūchestān'], terrain: 'coastal' },
  af_herat: { iso: 'AFG', names: ['Herat', 'Herāt'], terrain: 'mountain' },
  af_kabul: { iso: 'AFG', names: ['Kabul', 'Kābul'], terrain: 'mountain' },
  cn_dandong: { iso: 'CHN', names: ['Liaoning'], terrain: 'coastal' },
  iq_basra: { iso: 'IRQ', names: ['Basra', 'Al Basrah'], terrain: 'coastal' },
  iq_baghdad: { iso: 'IRQ', names: ['Baghdad', 'Baghdād'], terrain: 'plains' },
  kp_hamhung: { iso: 'PRK', names: ['South Hamgyong', 'Hamgyŏng-namdo', 'Hamgyongnam-do'], terrain: 'mountain' },
  kp_pyongyang: { iso: 'PRK', names: ['Pyongyang', 'P’yŏngyang'], terrain: 'plains' },
  us_washington: { iso: 'USA', names: ['District of Columbia', 'Washington, D.C.'], terrain: 'plains' },
  us_atlanta: { iso: 'USA', names: ['Georgia'], terrain: 'plains' },
  us_norfolk: { iso: 'USA', names: ['Virginia'], terrain: 'coastal' }
};

const UNIT_TEMPLATES = {
  ground: { hp: 100, org: 100, atk: 32, def: 20, symbol: '⊞' },
  air: { hp: 70, org: 80, atk: 18, def: 10, symbol: '✈' },
  naval: { hp: 90, org: 90, atk: 22, def: 14, symbol: '⚓' }
};

const UNIT_SYMBOL_BY_TYPE = {
  ground: '⊞',
  air: '✈',
  naval: '⚓'
};

const LEGACY_SYMBOL_MAP = { G: '⊞', A: '✈', N: '⚓' };

function getUnitDisplaySymbol(unit) {
  if (!unit) return '•';
  if (UNIT_SYMBOL_BY_TYPE[unit.type]) return UNIT_SYMBOL_BY_TYPE[unit.type];
  if (LEGACY_SYMBOL_MAP[unit.symbol]) return LEGACY_SYMBOL_MAP[unit.symbol];
  return unit.symbol || '•';
}

const state = {
  storyIndex: 0,
  story: [],
  missions: [],
  featuresById: {},
  missionIndex: 0,
  selected: null,
  selectedUnitId: null,
  phase: 'NATO',
  turn: 1,
  control: {},
  units: {},
  currentMission: null,
  pendingMoveFrom: null,
  dragMoveActive: false,
  projectedById: {},
  countryFeaturesByIso: {},
  groupedDivisions: true,
  combatTimer: null
};

const NATO_SYMBOL_DRAWERS = {
  ground(group, centerX, centerY) {
    const lineA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineA.setAttribute('x1', (centerX - 10).toString());
    lineA.setAttribute('y1', (centerY - 8).toString());
    lineA.setAttribute('x2', (centerX + 10).toString());
    lineA.setAttribute('y2', (centerY + 8).toString());
    lineA.classList.add('unit-icon');
    group.appendChild(lineA);

    const lineB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineB.setAttribute('x1', (centerX + 10).toString());
    lineB.setAttribute('y1', (centerY - 8).toString());
    lineB.setAttribute('x2', (centerX - 10).toString());
    lineB.setAttribute('y2', (centerY + 8).toString());
    lineB.classList.add('unit-icon');
    group.appendChild(lineB);
  },
  air(group, centerX, centerY) {
    const wing = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    wing.setAttribute('d', `M ${centerX - 13} ${centerY + 4} L ${centerX} ${centerY - 9} L ${centerX + 13} ${centerY + 4}`);
    wing.classList.add('unit-icon');
    group.appendChild(wing);
  },
  naval(group, centerX, centerY) {
    const hull = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    hull.setAttribute('cx', centerX.toString());
    hull.setAttribute('cy', centerY.toString());
    hull.setAttribute('rx', '12');
    hull.setAttribute('ry', '6');
    hull.classList.add('unit-icon');
    group.appendChild(hull);
  }
};

init();

async function init() {
  try {
    const missionRes = await fetch('data/missions.json');
    const missionData = await missionRes.json();

    const loadedFeatures = await loadProvinceFeatures(missionData.missions);
    state.featuresById = loadedFeatures.featuresById;
    state.countryFeaturesByIso = loadedFeatures.countryFeaturesByIso;

    state.story = missionData.story;
    state.missions = missionData.missions;

    storyText.textContent = state.story[state.storyIndex];
    storyNextBtn.addEventListener('click', onNextStory);
    attackBtn.addEventListener('click', handleAttack);
    endTurnBtn.addEventListener('click', endTurn);
    toggleGroupBtn.addEventListener('click', toggleDivisionGrouping);
    nextMissionBtn.addEventListener('click', nextMission);
    document.addEventListener('mouseup', () => {
      state.dragMoveActive = false;
    });
  } catch (error) {
    storyText.textContent = `Failed to load live province borders: ${error.message}`;
    storyNextBtn.disabled = true;
  }
}

async function loadProvinceFeatures(missions) {
  const requiredProvinceIds = new Set();
  missions.forEach((mission) => {
    ['playerControlled', 'enemyControlled', 'neutral', 'objectives'].forEach((key) => {
      (mission[key] || []).forEach((id) => requiredProvinceIds.add(id));
    });
    Object.entries(mission.adjacency || {}).forEach(([from, targets]) => {
      requiredProvinceIds.add(from);
      targets.forEach((target) => requiredProvinceIds.add(target));
    });
  });

  const requiredCountries = new Set(
    Array.from(requiredProvinceIds)
      .map((id) => PROVINCE_CATALOG[id]?.iso)
      .filter(Boolean)
  );

  const nationToIso = Object.fromEntries(
    Object.entries(COUNTRY_BOUNDARY_CATALOG).map(([iso, name]) => [name, iso])
  );
  missions.forEach((mission) => {
    (mission.focusNations || []).forEach((nation) => {
      const iso = nationToIso[nation];
      if (iso) requiredCountries.add(iso);
    });
  });

  const boundaryByCountry = {};
  await Promise.all(Array.from(requiredCountries).map(async (iso) => {
    boundaryByCountry[iso] = await fetchCountryProvinces(iso);
  }));

  const featuresById = {};
  requiredProvinceIds.forEach((provinceId) => {
    const config = PROVINCE_CATALOG[provinceId];
    if (!config) {
      throw new Error(`Missing province mapping for ${provinceId}. Add it to PROVINCE_CATALOG.`);
    }

    const sourceFeature = matchProvinceFeature(boundaryByCountry[config.iso], config.names);
    if (!sourceFeature) {
      throw new Error(`Could not match online province for ${provinceId} in ${COUNTRY_BOUNDARY_CATALOG[config.iso]}.`);
    }

    featuresById[provinceId] = {
      type: 'Feature',
      geometry: sourceFeature.geometry,
      properties: {
        id: provinceId,
        name: config.names[0],
        nation: COUNTRY_BOUNDARY_CATALOG[config.iso],
        terrain: config.terrain,
        sourceName: readFeatureName(sourceFeature)
      }
    };
  });

  return { featuresById, countryFeaturesByIso: boundaryByCountry };
}

async function fetchCountryProvinces(iso) {
  const metadataUrl = `https://www.geoboundaries.org/api/current/gbOpen/${iso}/ADM1/`;
  const fallbackGeometryUrls = [
    `https://cdn.jsdelivr.net/gh/wmgeolab/geoBoundaries@main/releaseData/gbOpen/${iso}/ADM1/geoBoundaries-${iso}-ADM1_simplified.geojson`,
    `https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/${iso}/ADM1/geoBoundaries-${iso}-ADM1_simplified.geojson`,
    `https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/${iso}/ADM1/geoBoundaries-${iso}-ADM1.geojson`,
    `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/${iso}/ADM1/geoBoundaries-${iso}-ADM1_simplified.geojson`,
    `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/${iso}/ADM1/geoBoundaries-${iso}-ADM1.geojson`
  ];

  const errors = [];
  let metadata = null;

  try {
    metadata = await fetchJsonWithTimeout(metadataUrl);
  } catch (error) {
    errors.push(`metadata: ${error.message}`);
  }

  const urlCandidates = [];
  if (metadata) {
    [
      metadata.simplifiedGeometryGeoJSON,
      metadata.gjDownloadURL,
      metadata.geoJSONURL,
      metadata.staticDownloadLink,
      metadata.geometryURL
    ].forEach((url) => {
      if (!url) return;
      normalizeGeoJsonUrl(url).forEach((normalized) => urlCandidates.push(normalized));
    });
  }
  fallbackGeometryUrls.forEach((url) => normalizeGeoJsonUrl(url).forEach((normalized) => urlCandidates.push(normalized)));

  const uniqueUrls = Array.from(new Set(urlCandidates)).filter((url) => !url.toLowerCase().endsWith('.zip'));
  for (const url of uniqueUrls) {
    try {
      const geoJson = await fetchJsonWithTimeout(url);
      if (Array.isArray(geoJson?.features) && geoJson.features.length) {
        return geoJson;
      }
      errors.push(`geometry: ${url} returned no features`);
    } catch (error) {
      errors.push(`geometry: ${url} -> ${error.message}`);
    }
  }

  const shortErrors = errors.slice(0, 5).join(' | ');
  throw new Error(`Failed loading online ADM1 GeoJSON for ${iso}. ${shortErrors}`);
}

function matchProvinceFeature(geoJson, candidateNames) {
  const wanted = candidateNames.map(normalizeName);
  return (geoJson.features || []).find((feature) => {
    const name = normalizeName(readFeatureName(feature));
    return wanted.some((candidate) => name === candidate || name.includes(candidate) || candidate.includes(name));
  });
}

function readFeatureName(feature) {
  const props = feature?.properties || {};
  return props.shapeName || props.name || props.NAME_1 || props.ADM1_EN || props.admin1Name || '';
}

function normalizeName(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}



function normalizeGeoJsonUrl(url) {
  const urls = [url];

  const githubMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:raw|blob)\/([^/]+)\/(.+)$/i);
  if (githubMatch) {
    const [, owner, repo, ref, path] = githubMatch;
    urls.push(`https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`);
    urls.push(`https://media.githubusercontent.com/media/${owner}/${repo}/${ref}/${path}`);
  }

  const rawMatch = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i);
  if (rawMatch) {
    const [, owner, repo, ref, path] = rawMatch;
    urls.push(`https://media.githubusercontent.com/media/${owner}/${repo}/${ref}/${path}`);
    if (!url.includes('?raw=1')) {
      urls.push(`${url}?raw=1`);
    }
  }

  return urls;
}

async function fetchJsonWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const body = await response.text();
    const trimmed = body.trim();
    if (!trimmed) {
      throw new Error('empty response body');
    }

    if (trimmed.startsWith('version https://git-lfs.github.com/spec/v1')) {
      throw new Error('Git LFS pointer response (not GeoJSON payload)');
    }

    if (trimmed[0] === '<') {
      throw new Error('received HTML instead of JSON');
    }

    try {
      return JSON.parse(trimmed);
    } catch (parseError) {
      throw new Error(`invalid JSON payload: ${parseError.message}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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


function toggleDivisionGrouping() {
  state.groupedDivisions = !state.groupedDivisions;
  toggleGroupBtn.textContent = state.groupedDivisions ? 'Ungroup Divisions View' : 'Group Divisions View';
  renderMap();
  if (state.selected) {
    renderProvinceInfo(state.selected);
  }
}

function loadMission(index) {
  const mission = state.missions[index];
  state.missionIndex = index;
  state.currentMission = mission;
  state.selected = null;
  state.selectedUnitId = null;
  state.pendingMoveFrom = null;
  state.phase = 'NATO';
  state.turn = 1;
  state.control = {};
  state.units = {};
  nextMissionBtn.classList.add('hidden');
  toggleGroupBtn.textContent = state.groupedDivisions ? 'Ungroup Divisions View' : 'Group Divisions View';

  const missionProvinceIds = new Set(Object.keys(mission.adjacency || {}));
  Object.values(mission.adjacency || {}).forEach((targets) => targets.forEach((targetId) => missionProvinceIds.add(targetId)));

  missionProvinceIds.forEach((id) => {
    const allegiance = mission.allegiances?.[id]
      || (mission.playerControlled || []).includes(id) && 'nato'
      || (mission.enemyControlled || []).includes(id) && 'enemy'
      || (mission.neutral || []).includes(id) && 'nato'
      || 'enemy';

    state.control[id] = allegiance;
    state.units[id] = allegiance === 'enemy' || allegiance === 'nato' ? createProvinceUnits(allegiance, id) : [];

    if ((mission.playerControlled || []).includes(id)) {
      state.units[id] = createProvinceUnits('nato', id);
    } else if ((mission.enemyControlled || []).includes(id)) {
      state.units[id] = createProvinceUnits('enemy', id);
    } else if ((mission.neutral || []).includes(id)) {
      state.units[id] = createProvinceUnits('nato', id);
    }
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
  const makeUnit = (template, type) => ({
    ...template,
    id: `${provinceId}_${type}_${Math.random().toString(36).slice(2, 9)}`,
    type,
    symbol: UNIT_SYMBOL_BY_TYPE[type]
  });

  const ground = makeUnit(UNIT_TEMPLATES.ground, 'ground');
  const air = makeUnit(UNIT_TEMPLATES.air, 'air');
  const naval = makeUnit(UNIT_TEMPLATES.naval, 'naval');

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
  state.projectedById = {};

  const mission = state.currentMission;
  const missionProvinceIds = new Set(Object.keys(mission.adjacency || {}));
  Object.values(mission.adjacency || {}).forEach((targets) => targets.forEach((targetId) => missionProvinceIds.add(targetId)));

  const relevant = Array.from(missionProvinceIds)
    .map((id) => state.featuresById[id])
    .filter(Boolean);

  const focusNationIsos = new Set(
    (mission.focusNations || [])
      .map((nation) => Object.entries(COUNTRY_BOUNDARY_CATALOG).find(([, name]) => name === nation)?.[0])
      .filter(Boolean)
  );

  relevant.forEach((feature) => {
    const iso = PROVINCE_CATALOG[feature.properties.id]?.iso;
    if (iso) focusNationIsos.add(iso);
  });

  const countryControlByIso = computeCountryControl(Array.from(missionProvinceIds));

  const backdropFeatures = Array.from(focusNationIsos).flatMap((iso) => {
    const countryGeoJson = state.countryFeaturesByIso[iso];
    return (countryGeoJson?.features || []).map((feature, index) => ({
      id: `${iso}_${index}`,
      iso,
      rings: getFeatureOuterRings(feature).map((ring) => ring.map(projectPoint)),
      backdrop: true
    }));
  });

  if (!relevant.length) return;

  const projected = relevant.map((f) => ({
    id: f.properties.id,
    rings: getFeatureOuterRings(f).map((ring) => ring.map(projectPoint))
  }));

  const allProjected = backdropFeatures.concat(projected);
  if (!allProjected.length) return;

  const bounds = getBounds(allProjected.flatMap((f) => f.rings).flat());
  const scale = Math.min(940 / bounds.width, 520 / bounds.height);

  backdropFeatures.forEach((feature) => {
    const projectedRings = feature.rings.map((ring) => ring.map((pt) => ({
      x: (pt.x - bounds.minX) * scale + 30,
      y: (pt.y - bounds.minY) * scale + 30
    })));

    const pathData = projectedRings
      .map((ring) => ring
        .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
        .join(' ') + ' Z')
      .join(' ');

    const controlClass = countryControlByIso[feature.iso] || 'neutral';

    const backdropPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    backdropPath.setAttribute('d', pathData);
    backdropPath.classList.add('nation-backdrop', controlClass);
    mapSvg.appendChild(backdropPath);

    const borderPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    borderPath.setAttribute('d', pathData);
    borderPath.classList.add('nation-border', controlClass);
    mapSvg.appendChild(borderPath);
  });

  const provinceCentroids = {};

  projected.forEach((feature) => {
    const projectedRings = feature.rings.map((ring) => ring.map((pt) => ({
      x: (pt.x - bounds.minX) * scale + 30,
      y: (pt.y - bounds.minY) * scale + 30
    })));
    state.projectedById[feature.id] = projectedRings;

    const pathData = projectedRings
      .map((ring) => ring
        .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
        .join(' ') + ' Z')
      .join(' ');

    const provincePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    provincePath.setAttribute('d', pathData);
    provincePath.classList.add('province', state.control[feature.id] || 'neutral');
    provincePath.dataset.provinceId = feature.id;

    if (state.selected === feature.id) {
      provincePath.classList.add('selected');
    }

    provincePath.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      if (state.phase !== 'NATO') return;
      if (!state.selected) return;
      if (state.control[state.selected] !== 'nato') return;
      if ((state.units[state.selected] || []).length === 0) return;
      if (feature.id === state.selected) return;

      state.pendingMoveFrom = state.selected;
      state.dragMoveActive = true;
      renderMap();
    });

    provincePath.addEventListener('mouseup', async () => {
      if (!state.dragMoveActive || !state.pendingMoveFrom) return;
      state.dragMoveActive = false;

      if (state.pendingMoveFrom !== feature.id) {
        await executeMoveCommand(state.pendingMoveFrom, feature.id);
        return;
      }

      renderMap();
    });

    provincePath.addEventListener('click', async () => {
      if (state.dragMoveActive) return;
      if (!state.selected) {
        log('Select a NATO unit first, then click a destination province.');
        return;
      }
      if (feature.id === state.selected) return;

      await executeMoveCommand(state.selected, feature.id);
    });

    mapSvg.appendChild(provincePath);

    const [cx, cy] = centroidFromRings(projectedRings);
    provinceCentroids[feature.id] = [cx, cy];
  });

  renderMissionRoutes(provinceCentroids);
  Object.entries(provinceCentroids).forEach(([provinceId, [cx, cy]]) => {
    renderUnitSymbol(provinceId, cx, cy);
  });
}

function renderMissionRoutes(centroidByProvince) {
  const seen = new Set();
  Object.entries(state.currentMission.adjacency || {}).forEach(([from, targets]) => {
    targets.forEach((to) => {
      if (!centroidByProvince[from] || !centroidByProvince[to]) return;
      const edgeId = [from, to].sort().join('::');
      if (seen.has(edgeId)) return;
      seen.add(edgeId);

      const [x1, y1] = centroidByProvince[from];
      const [x2, y2] = centroidByProvince[to];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toFixed(1));
      line.setAttribute('y1', y1.toFixed(1));
      line.setAttribute('x2', x2.toFixed(1));
      line.setAttribute('y2', y2.toFixed(1));
      line.classList.add('route-link');
      mapSvg.appendChild(line);
    });
  });
}

function renderUnitSymbol(provinceId, cx, cy) {
  const side = state.control[provinceId];
  const units = state.units[provinceId] || [];
  if (!units.length || side === 'neutral') return;

  const renderCounter = (x, y, unit, unitCount) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('nato-symbol', side);
    if (state.pendingMoveFrom === provinceId || (state.selected === provinceId && state.selectedUnitId === unit.id)) {
      group.classList.add('active-move-source');
    }
    group.dataset.provinceId = provinceId;
    group.dataset.unitId = unit.id;

    const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    frame.setAttribute('x', (x - 25).toString());
    frame.setAttribute('y', (y - 14).toString());
    frame.setAttribute('width', '50');
    frame.setAttribute('height', '28');
    frame.classList.add('unit-frame', side);
    group.appendChild(frame);

    const iconDrawer = NATO_SYMBOL_DRAWERS[unit.type] || NATO_SYMBOL_DRAWERS.ground;
    iconDrawer(group, x, y);

    const factionFlag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    factionFlag.setAttribute('x', (x - 20).toString());
    factionFlag.setAttribute('y', (y - 6).toString());
    factionFlag.classList.add('unit-flag');
    factionFlag.textContent = getUnitFlagLabel(provinceId, side);
    group.appendChild(factionFlag);

    if (unitCount > 1) {
      const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      count.setAttribute('x', (x + 19).toString());
      count.setAttribute('y', (y + 12).toString());
      count.classList.add('unit-count');
      count.textContent = String(unitCount);
      group.appendChild(count);
    }

    group.addEventListener('click', (event) => {
      event.stopPropagation();
      handleUnitClick(provinceId, unit.id);
    });

    mapSvg.appendChild(group);
  };

  if (state.groupedDivisions) {
    const dominantUnit = units[0] || { type: 'ground' };
    renderCounter(cx, cy, dominantUnit, units.length);
    return;
  }

  const spacing = 32;
  const startY = cy - ((units.length - 1) * spacing) / 2;
  units.forEach((unit, index) => {
    const y = startY + index * spacing;
    renderCounter(cx, y, unit, 1);
  });
}

function getUnitFlagLabel(provinceId, side) {
  if (side === 'nato') return '⚑ NATO';
  const iso = PROVINCE_CATALOG[provinceId]?.iso;
  if (iso === 'IRN') return '🇮🇷 IRN';
  if (iso === 'CHN') return '🇨🇳 CHN';
  return '☭ CSTO';
}

function handleUnitClick(provinceId, unitId) {
  if (state.phase !== 'NATO') {
    log('Wait for NATO phase to issue unit commands.');
    return;
  }
  if (state.control[provinceId] !== 'nato') {
    log('You can only command NATO units on your turn.');
    return;
  }

  state.selected = provinceId;
  state.selectedUnitId = unitId;
  renderMap();
  renderProvinceInfo(provinceId);
  buildTargetOptions(provinceId);
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
  const sideLabel = side === 'nato' ? 'ALLY' : 'ENEMY';

  const unitText = units.length
    ? units.map((u, idx) => {
      const selectedMarker = u.id === state.selectedUnitId ? ' ⭐' : '';
      return `${idx + 1}. ${u.symbol || UNIT_SYMBOL_BY_TYPE[u.type] || '•'} ${u.type.toUpperCase()} HP:${Math.max(0, Math.round(u.hp))} ORG:${Math.max(0, Math.round(u.org))}${selectedMarker}`;
    }).join('<br>')
    : 'No stationed units';

  provinceInfo.innerHTML = `
    <strong>${feature.properties.name}</strong><br>
    Nation: ${feature.properties.nation}<br>
    Terrain: ${feature.properties.terrain}<br>
    Control: ${sideLabel}<br><br>
    ${unitText}
  `;
}

async function handleAttack() {
  if (state.phase !== 'NATO') {
    log('Wait for NATO phase to issue attacks.');
    return;
  }

  const from = state.selected;
  const to = targetSelect.value;
  if (!from || !to) {
    log('Select a NATO unit and valid enemy target.');
    return;
  }

  const attackRoute = findPath(from, to, (neighbor, current, goal) => {
    if (neighbor === goal) return state.control[goal] === 'enemy';
    return state.control[neighbor] === 'nato';
  });

  if (!attackRoute || attackRoute.length < 2) {
    log('No viable path to attack target through connected friendly provinces.');
    return;
  }

  const stagingProvince = attackRoute[attackRoute.length - 2];
  if (stagingProvince !== from) {
    transferUnits(from, stagingProvince, 'nato', attackRoute.slice(0, -1));
  }

  await resolveBattleOverTime(stagingProvince, to, 'nato');
  renderMap();
  renderProvinceInfo(stagingProvince);
  checkVictory();
}




async function executeMoveCommand(from, to) {
  if (state.phase !== 'NATO') {
    log('You can only issue movement orders during the NATO phase.');
    state.pendingMoveFrom = null;
    renderMap();
    return;
  }

  state.pendingMoveFrom = null;
  if ((state.units[from] || []).length === 0) {
    log('No units available to move.');
    renderMap();
    return;
  }

  const destinationDefended = isEnemyProvinceDefended(to);
  const path = findPath(from, to, () => true);

  if (!path || path.length < 2) {
    log(`No valid movement corridor from ${state.featuresById[from].properties.name} to ${state.featuresById[to].properties.name}.`);
    renderMap();
    return;
  }

  if (destinationDefended) {
    const marchPath = path.slice(0, -1);
    if (marchPath.length > 1) {
      await moveUnitsAlongPathOverTime(marchPath, 'nato');
      log(`Advanced via ${formatPathNames(marchPath)}.`);
    }

    const stagingProvince = path[path.length - 2];
    await resolveBattleOverTime(stagingProvince, to, 'nato');
    state.selected = stagingProvince;
  } else {
    await moveUnitsAlongPathOverTime(path, 'nato');
    log(`Moved forces along ${formatPathNames(path)}.`);
    state.selected = to;
  }

  const selectedUnits = state.units[state.selected] || [];
  state.selectedUnitId = selectedUnits[0]?.id || null;

  renderMap();
  renderProvinceInfo(state.selected);
  buildTargetOptions(state.selected);
  checkVictory();
}

function isEnemyProvinceDefended(provinceId) {
  return state.control[provinceId] === 'enemy' && (state.units[provinceId] || []).length > 0;
}

async function moveUnitsAlongPathOverTime(path, side) {
  if (!path || path.length < 2) return;

  for (let i = 1; i < path.length; i += 1) {
    const fromId = path[i - 1];
    const toId = path[i];
    transferUnitsSingleStep(fromId, toId, side);
    renderMap();
    if (state.selected) renderProvinceInfo(state.selected);
    await sleep(220);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function transferUnitsSingleStep(fromId, toId, side) {
  const moving = state.units[fromId] || [];
  if (!moving.length) return;

  state.units[fromId] = [];
  if (!state.units[toId]) state.units[toId] = [];

  const toSide = state.control[toId] || 'enemy';
  if (toSide !== side) {
    const defenders = state.units[toId] || [];
    if (defenders.length > 0) {
      log(`Movement halted at ${state.featuresById[toId].properties.name}: defended by enemy forces.`);
      state.units[fromId] = moving;
      return;
    }

    state.control[toId] = side;
    if (toSide === 'enemy') {
      log(`${state.featuresById[toId].properties.name} was unguarded and is now captured while advancing.`);
    }
  }

  state.units[toId] = state.units[toId].concat(
    moving.map((u) => ({ ...u, org: Math.max(10, u.org - 2) }))
  );
}

function transferUnits(fromId, toId, side, path) {
  const moving = state.units[fromId] || [];
  if (!moving.length) {
    log('No units available to move.');
    return;
  }

  state.units[fromId] = [];
  state.control[toId] = side;
  if (!state.units[toId]) state.units[toId] = [];
  state.units[toId] = state.units[toId].concat(moving.map((u) => ({ ...u, org: Math.max(10, u.org - Math.max(0, path.length - 1) * 2) })));
}

function resolveBattleOverTime(fromId, toId, attackerSide) {
  if (state.combatTimer) {
    clearInterval(state.combatTimer);
    state.combatTimer = null;
  }

  return new Promise((resolve) => {
    let ticks = 0;
    const maxTicks = 4;

    state.combatTimer = setInterval(() => {
      ticks += 1;
      resolveBattle(fromId, toId, attackerSide, 0.35);
      renderMap();
      if (state.selected) renderProvinceInfo(state.selected);

      const battleDone = (state.units[toId] || []).length === 0 || (state.units[fromId] || []).length === 0;
      if (ticks >= maxTicks || battleDone) {
        clearInterval(state.combatTimer);
        state.combatTimer = null;
        resolve();
      }
    }, 260);
  });
}

function resolveBattle(fromId, toId, attackerSide, intensity = 1) {
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
  const inflicted = 20 * ratio * intensity;
  const retaliate = (14 / Math.max(1, ratio)) * intensity;

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
    state.units[fromId] = [];
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
      state.control[pid] = 'nato';
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


function computeCountryControl(provinceIds) {
  const tallies = {};
  provinceIds.forEach((provinceId) => {
    const iso = PROVINCE_CATALOG[provinceId]?.iso;
    if (!iso) return;
    if (!tallies[iso]) tallies[iso] = { nato: 0, enemy: 0, neutral: 0 };
    const side = state.control[provinceId] || 'neutral';
    tallies[iso][side] += 1;
  });

  return Object.fromEntries(Object.entries(tallies).map(([iso, counts]) => {
    if (counts.enemy > counts.nato) return [iso, 'enemy'];
    if (counts.nato > counts.enemy) return [iso, 'nato'];
    return [iso, 'neutral'];
  }));
}

function findPath(fromId, toId, passable) {
  if (fromId === toId) return [fromId];
  const visited = new Set([fromId]);
  const queue = [[fromId]];

  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];
    const neighbors = state.currentMission.adjacency[current] || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      if (!passable(neighbor, current, toId)) continue;

      const nextPath = path.concat(neighbor);
      if (neighbor === toId) return nextPath;
      visited.add(neighbor);
      queue.push(nextPath);
    }
  }

  return null;
}

function formatPathNames(path) {
  return path.map((pid) => state.featuresById[pid]?.properties?.name || pid).join(' → ');
}

function getFeatureOuterRings(feature) {
  if (!feature?.geometry) return [];
  if (feature.geometry.type === 'Polygon') return [feature.geometry.coordinates[0]];
  if (feature.geometry.type === 'MultiPolygon') return feature.geometry.coordinates.map((poly) => poly[0]);
  return [];
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

function centroidFromRings(rings) {
  const valid = rings.flat().map((pt) => [pt.x, pt.y]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const count = valid.length || 1;
  const sum = valid.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / count, sum[1] / count];
}

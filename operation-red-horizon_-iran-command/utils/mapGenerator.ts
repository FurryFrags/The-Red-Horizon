
import { Province, Faction, TerrainType } from '../types';
import * as d3 from 'd3-delaunay';

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1200;

// ------------------------------------------------------------------
// HIGH-FIDELITY VECTOR BORDERS (The "Cookie Cutters")
// ------------------------------------------------------------------
const COUNTRY_PATHS: Record<string, string> = {
  IRAN: "M 950,320 L 1000,310 L 1100,300 L 1180,290 L 1200,310 L 1250,320 L 1350,300 L 1400,280 L 1450,290 L 1550,320 L 1650,350 L 1640,450 L 1660,550 L 1650,650 L 1700,700 L 1650,800 L 1600,900 L 1500,950 L 1400,960 L 1350,920 L 1300,940 L 1250,900 L 1150,850 L 1120,750 L 1050,650 L 980,550 L 950,450 L 950,450 L 950,320 Z",
  
  IRAQ: "M 950,450 L 980,550 L 1050,650 L 1120,750 L 1130,820 L 1050,850 L 950,800 L 850,750 L 750,700 L 720,600 L 750,500 L 750,460 L 850,450 L 950,450 Z",
  
  TURKEY: "M 950,320 L 950,450 L 850,450 L 750,460 L 700,480 L 650,520 L 620,580 L 600,520 L 550,500 L 450,520 L 400,500 L 350,520 L 300,480 L 250,460 L 200,420 L 150,380 L 100,340 L 100,260 L 200,280 L 250,230 L 350,210 L 500,160 L 600,140 L 700,160 L 800,180 L 920,170 L 930,250 L 950,320 Z",
  
  AFGHANISTAN: "M 1650,350 L 1750,360 L 1850,380 L 1950,400 L 1980,420 L 1950,450 L 1900,550 L 1850,650 L 1800,750 L 1700,700 L 1650,650 L 1660,550 L 1640,450 L 1650,350 Z",
  
  CAUCASUS: "M 920,170 L 1050,140 L 1150,160 L 1200,190 L 1250,240 L 1220,270 L 1180,290 L 1100,300 L 1000,310 L 950,320 L 930,250 L 920,170 Z"
};

// ------------------------------------------------------------------
// MANUAL PROVINCE SEEDS
// ------------------------------------------------------------------
const PROVINCE_SEEDS = [
  // --- IRAN ---
  { id: 101, x: 1050, y: 360, name: "East Azerbaijan", state: "Azerbaijan", country: "IRAN", terrain: TerrainType.MOUNTAIN, vp: 20 },
  { id: 102, x: 1000, y: 320, name: "West Azerbaijan", state: "Azerbaijan", country: "IRAN", terrain: TerrainType.MOUNTAIN, vp: 10 },
  { id: 103, x: 1120, y: 380, name: "Ardabil", state: "Azerbaijan", country: "IRAN", terrain: TerrainType.HILLS, vp: 5 },
  { id: 104, x: 1200, y: 320, name: "Gilan", state: "Caspian", country: "IRAN", terrain: TerrainType.HILLS, vp: 15, isCoastal: true },
  { id: 105, x: 1300, y: 320, name: "Mazandaran", state: "Caspian", country: "IRAN", terrain: TerrainType.HILLS, vp: 15, isCoastal: true },
  { id: 106, x: 1400, y: 320, name: "Golestan", state: "Caspian", country: "IRAN", terrain: TerrainType.PLAINS, vp: 10, isCoastal: true },
  { id: 107, x: 1250, y: 420, name: "Tehran", state: "Tehran", country: "IRAN", terrain: TerrainType.URBAN, vp: 50 },
  { id: 108, x: 1200, y: 450, name: "Qom", state: "Central", country: "IRAN", terrain: TerrainType.PLAINS, vp: 10 },
  { id: 109, x: 1100, y: 450, name: "Kurdistan", state: "Kurdistan", country: "IRAN", terrain: TerrainType.MOUNTAIN, vp: 10 },
  { id: 110, x: 1080, y: 520, name: "Kermanshah", state: "Kurdistan", country: "IRAN", terrain: TerrainType.MOUNTAIN, vp: 15 },
  { id: 111, x: 1150, y: 550, name: "Luristan", state: "Zagros", country: "IRAN", terrain: TerrainType.MOUNTAIN, vp: 5 },
  { id: 112, x: 1150, y: 700, name: "Khuzestan North", state: "Khuzestan", country: "IRAN", terrain: TerrainType.PLAINS, vp: 20 },
  { id: 113, x: 1180, y: 780, name: "Khuzestan South", state: "Khuzestan", country: "IRAN", terrain: TerrainType.URBAN, vp: 25, isCoastal: true, hasPort: true },
  { id: 114, x: 1280, y: 600, name: "Isfahan", state: "Isfahan", country: "IRAN", terrain: TerrainType.URBAN, vp: 30 },
  { id: 115, x: 1380, y: 650, name: "Yazd", state: "Central", country: "IRAN", terrain: TerrainType.DESERT, vp: 10 },
  { id: 116, x: 1300, y: 800, name: "Fars", state: "Fars", country: "IRAN", terrain: TerrainType.URBAN, vp: 25 },
  { id: 117, x: 1250, y: 880, name: "Bushehr", state: "Fars", country: "IRAN", terrain: TerrainType.COASTAL_DESERT, vp: 15, isCoastal: true, hasPort: true },
  { id: 118, x: 1450, y: 750, name: "Kerman", state: "Kerman", country: "IRAN", terrain: TerrainType.DESERT, vp: 15 },
  { id: 119, x: 1350, y: 900, name: "Hormozgan", state: "Hormozgan", country: "IRAN", terrain: TerrainType.COASTAL_DESERT, vp: 20, isCoastal: true, hasPort: true },
  { id: 120, x: 1550, y: 800, name: "Sistan", state: "Sistan", country: "IRAN", terrain: TerrainType.DESERT, vp: 5 },
  { id: 121, x: 1450, y: 920, name: "Baluchestan", state: "Sistan", country: "IRAN", terrain: TerrainType.COASTAL_DESERT, vp: 5, isCoastal: true },
  { id: 122, x: 1550, y: 550, name: "South Khorasan", state: "Khorasan", country: "IRAN", terrain: TerrainType.DESERT, vp: 5 },
  { id: 123, x: 1500, y: 400, name: "Razavi Khorasan", state: "Khorasan", country: "IRAN", terrain: TerrainType.URBAN, vp: 25 },
  { id: 124, x: 1400, y: 450, name: "Semnan", state: "Central", country: "IRAN", terrain: TerrainType.DESERT, vp: 5 },

  // --- IRAQ ---
  { id: 201, x: 880, y: 480, name: "Nineveh", state: "Mosul", country: "IRAQ", terrain: TerrainType.URBAN, vp: 15 },
  { id: 202, x: 950, y: 520, name: "Erbil", state: "Kurdistan", country: "IRAQ", terrain: TerrainType.MOUNTAIN, vp: 15 },
  { id: 203, x: 920, y: 580, name: "Kirkuk", state: "Kurdistan", country: "IRAQ", terrain: TerrainType.HILLS, vp: 10 },
  { id: 204, x: 950, y: 650, name: "Baghdad", state: "Baghdad", country: "IRAQ", terrain: TerrainType.URBAN, vp: 30 },
  { id: 205, x: 850, y: 600, name: "Anbar", state: "West Iraq", country: "IRAQ", terrain: TerrainType.DESERT, vp: 5 },
  { id: 206, x: 1000, y: 700, name: "Nasiriyah", state: "South Iraq", country: "IRAQ", terrain: TerrainType.PLAINS, vp: 10 },
  { id: 207, x: 1080, y: 780, name: "Basra", state: "Basra", country: "IRAQ", terrain: TerrainType.URBAN, vp: 20, isCoastal: true, hasPort: true },

  // --- TURKEY ---
  { id: 301, x: 900, y: 380, name: "Van", state: "East Anatolia", country: "TURKEY", terrain: TerrainType.MOUNTAIN, vp: 10 },
  { id: 302, x: 800, y: 420, name: "Diyarbakir", state: "Kurdistan", country: "TURKEY", terrain: TerrainType.HILLS, vp: 10 },
  { id: 303, x: 850, y: 300, name: "Erzurum", state: "East Anatolia", country: "TURKEY", terrain: TerrainType.MOUNTAIN, vp: 10 },
  { id: 304, x: 700, y: 350, name: "Sivas", state: "Central Anatolia", country: "TURKEY", terrain: TerrainType.HILLS, vp: 5 },
  { id: 305, x: 500, y: 300, name: "Ankara", state: "Ankara", country: "TURKEY", terrain: TerrainType.URBAN, vp: 30 },
  { id: 306, x: 280, y: 260, name: "Istanbul", state: "Istanbul", country: "TURKEY", terrain: TerrainType.URBAN, vp: 30, isCoastal: true },
  { id: 307, x: 300, y: 400, name: "Izmir", state: "Izmir", country: "TURKEY", terrain: TerrainType.URBAN, vp: 20, isCoastal: true },
  { id: 308, x: 500, y: 450, name: "Konya", state: "Central Anatolia", country: "TURKEY", terrain: TerrainType.PLAINS, vp: 10 },
  { id: 309, x: 600, y: 500, name: "Adana", state: "South Anatolia", country: "TURKEY", terrain: TerrainType.PLAINS, vp: 15, isCoastal: true },

  // --- AFGHANISTAN ---
  { id: 401, x: 1680, y: 480, name: "Herat", state: "Herat", country: "AFGHANISTAN", terrain: TerrainType.PLAINS, vp: 10 },
  { id: 402, x: 1750, y: 700, name: "Kandahar", state: "Kandahar", country: "AFGHANISTAN", terrain: TerrainType.DESERT, vp: 15 },
  { id: 403, x: 1850, y: 550, name: "Kabul", state: "Kabul", country: "AFGHANISTAN", terrain: TerrainType.URBAN, vp: 20 },

  // --- CAUCASUS ---
  { id: 501, x: 1220, y: 260, name: "Baku", state: "Azerbaijan", country: "CAUCASUS", terrain: TerrainType.URBAN, vp: 25, isCoastal: true },
  { id: 502, x: 1050, y: 280, name: "Yerevan", state: "Armenia", country: "CAUCASUS", terrain: TerrainType.MOUNTAIN, vp: 10 },
  { id: 503, x: 1020, y: 220, name: "Tbilisi", state: "Georgia", country: "CAUCASUS", terrain: TerrainType.URBAN, vp: 15 },
];


export const generateProvinces = () => {
  try {
    if (!d3 || !d3.Delaunay) throw new Error("D3 Library not loaded");

    // 1. Setup Points from Seeds
    const points = PROVINCE_SEEDS.map(p => [p.x, p.y] as [number, number]);
    
    // 2. Generate Voronoi Diagram
    // Using a bounding box slightly larger than the map to ensure edge cells are generated
    const voronoi = d3.Delaunay.from(points).voronoi([-500, -500, MAP_WIDTH + 500, MAP_HEIGHT + 500]);

    const provinces: Province[] = [];

    for (let i = 0; i < PROVINCE_SEEDS.length; i++) {
        const seed = PROVINCE_SEEDS[i];
        const polygon = voronoi.cellPolygon(i);
        
        if (!polygon) continue;

        const path = `M${polygon.map(pt => pt.map(c => c.toFixed(1)).join(',')).join('L')}Z`;

        let owner = Faction.NEUTRAL;
        if (seed.country === 'TURKEY') owner = Faction.NATO;
        if (seed.country === 'IRAN') owner = Faction.IRAN;
        if (seed.country === 'IRAQ') owner = seed.state === "Kurdistan" ? Faction.KURDISTAN : Faction.NEUTRAL;
        if (seed.country === 'CAUCASUS') owner = Faction.NEUTRAL;

        // Extract neighbors
        // voronoi.neighbors(i) returns an iterator of indices into the points array
        const neighborIndices = Array.from(voronoi.neighbors(i));
        const neighborIds = neighborIndices.map(idx => PROVINCE_SEEDS[idx].id);

        provinces.push({
            id: seed.id,
            name: seed.name,
            country: seed.country,
            stateName: seed.state,
            owner: owner,
            controller: owner,
            terrain: seed.terrain,
            manpower: 1000 + (seed.vp * 100),
            infrastructure: 5,
            factories: seed.vp > 20 ? 4 : 1,
            antiAir: 0,
            isCoastal: seed.isCoastal || false,
            hasPort: seed.hasPort || false,
            victoryPoints: seed.vp,
            supplyLimit: 15,
            resistance: 0,
            compliance: 100,
            neighbors: neighborIds,
            path: path,
            center: [seed.x, seed.y]
        });
    }

    return { 
        provinces, 
        countryBorders: COUNTRY_PATHS 
    };

  } catch (e) {
    console.error("Map Gen Error:", e);
    return { provinces: [], countryBorders: {} };
  }
};

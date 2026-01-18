
export enum TerrainType {
  PLAINS = 'Plains',
  DESERT = 'Desert',
  MOUNTAIN = 'Mountain',
  HILLS = 'Hills',
  URBAN = 'Urban',
  COASTAL_DESERT = 'Coastal Desert'
}

export enum Faction {
  NATO = 'NATO',
  IRAN = 'Iran Regime',
  KURDISTAN = 'Kurdish Rebels',
  CSTO = 'CSTO',
  CHINA = 'PRC',
  NEUTRAL = 'Neutral'
}

export enum UnitType {
  INFANTRY = 'Infantry',
  TANK = 'Armor',
  MECHANIZED = 'Mechanized',
  MOUNTAINEER = 'Mountaineer',
  MARINE = 'Marine',
  HQ = 'HQ'
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  faction: Faction;
  provinceId: number;
  armyGroupId: string;
  organization: number; // 0-100
  strength: number; // 0-100
  isMoving?: boolean;
  targetProvinceId?: number | null;
}

export interface ArmyGroup {
  id: string;
  name: string;
  commanderName: string;
  portraitColor: string; // CSS color for placeholder
  color: string; // UI highlight color
  faction: Faction;
  order?: string; // "Frontline", "Fallback", etc.
  portraitId?: number;
}

export interface Province {
  id: number;
  name: string;
  country: string;
  stateName: string;
  owner: Faction;
  controller: Faction;
  terrain: TerrainType;
  manpower: number;
  infrastructure: number;
  factories: number;
  antiAir: number;
  isCoastal: boolean;
  hasPort: boolean;
  victoryPoints: number;
  supplyLimit: number;
  resistance: number;
  compliance: number;
  
  // Graph data
  neighbors: number[];

  // Rendering data
  path: string; 
  center: [number, number]; 
}

export interface GameState {
  tension: number;
  politicalPower: number;
  stability: number;
  warSupport: number;
  manpower: number;
  factories: number;
  armyExperience: number;
  navyExperience: number;
  airExperience: number;
  date: string;
}


import React, { useState, useEffect, useCallback } from 'react';
import { Province, Faction, ArmyGroup, Unit, UnitType } from './types';
import { generateProvinces } from './utils/mapGenerator';
import GameMap from './components/GameMap';
import DialogueOverlay from './components/DialogueOverlay';
import { CHAPTER_1_SCRIPT } from './story/script';

// Mock Initial Data
const INITIAL_ARMY_GROUPS: ArmyGroup[] = [
  { id: 'ag_iran_1', name: '1st Armored', commanderName: 'Gen. A. Rahimi', color: '#ef4444', portraitId: 1, portraitColor: 'bg-red-800', faction: Faction.IRAN },
  { id: 'ag_nato_1', name: 'TF Alpha', commanderName: 'Gen. Shepherd', color: '#3b82f6', portraitId: 2, portraitColor: 'bg-blue-800', faction: Faction.NATO },
];

const INITIAL_UNITS: Unit[] = [
  // --- IRANIAN UNITS ---
  // North
  { id: 'u1', name: '88th Armor', type: UnitType.TANK, faction: Faction.IRAN, provinceId: 101, armyGroupId: 'ag_iran_1', organization: 95, strength: 100 },
  { id: 'u2', name: '16th Armor', type: UnitType.TANK, faction: Faction.IRAN, provinceId: 102, armyGroupId: 'ag_iran_1', organization: 90, strength: 95 },
  // Central/Tehran
  { id: 'u4', name: '27th Div', type: UnitType.INFANTRY, faction: Faction.IRAN, provinceId: 107, armyGroupId: 'ag_iran_1', organization: 100, strength: 100 },
  { id: 'u5', name: '10th Div', type: UnitType.INFANTRY, faction: Faction.IRAN, provinceId: 107, armyGroupId: 'ag_iran_1', organization: 98, strength: 100 },
  // South/Coastal
  { id: 'u7', name: 'Marines 1', type: UnitType.MARINE, faction: Faction.IRAN, provinceId: 113, armyGroupId: 'ag_iran_1', organization: 80, strength: 100 },
  { id: 'u9', name: 'Coastal Art', type: UnitType.INFANTRY, faction: Faction.IRAN, provinceId: 119, armyGroupId: 'ag_iran_1', organization: 60, strength: 80 },

  // --- NATO UNITS (Baluchestan Landing) ---
  { id: 'n1', name: '1st USMC', type: UnitType.MARINE, faction: Faction.NATO, provinceId: 121, armyGroupId: 'ag_nato_1', organization: 100, strength: 100 },
  { id: 'n2', name: '2nd USMC', type: UnitType.MARINE, faction: Faction.NATO, provinceId: 121, armyGroupId: 'ag_nato_1', organization: 100, strength: 100 },
  { id: 'n3', name: '3rd Infantry', type: UnitType.INFANTRY, faction: Faction.NATO, provinceId: 121, armyGroupId: 'ag_nato_1', organization: 100, strength: 100 },
  { id: 'n4', name: '101st Airborne', type: UnitType.MECHANIZED, faction: Faction.NATO, provinceId: 121, armyGroupId: 'ag_nato_1', organization: 95, strength: 100 },
  { id: 'n5', name: 'TF Command', type: UnitType.HQ, faction: Faction.NATO, provinceId: 121, armyGroupId: 'ag_nato_1', organization: 100, strength: 100 },
  { id: 'n6', name: '4th Infantry', type: UnitType.INFANTRY, faction: Faction.NATO, provinceId: 121, armyGroupId: 'ag_nato_1', organization: 90, strength: 100 },
];

const App: React.FC = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [countryBorders, setCountryBorders] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  
  // Story State
  const [isStoryActive, setIsStoryActive] = useState(true);

  useEffect(() => {
    const { provinces: p, countryBorders: b } = generateProvinces();
    
    // Set Baluchestan (121) to NATO control
    const updatedProvinces = p.map(prov => {
      if (prov.id === 121) {
        return {
          ...prov,
          owner: Faction.NATO,
          controller: Faction.NATO
        };
      }
      return prov;
    });

    setProvinces(updatedProvinces);
    setCountryBorders(b);
  }, []);

  // Simple BFS Pathfinding to find the next step towards the target
  const findNextStep = useCallback((startId: number, targetId: number): number => {
    if (startId === targetId) return startId;

    const queue: { id: number; path: number[] }[] = [{ id: startId, path: [startId] }];
    const visited = new Set<number>();
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Look up province to get neighbors
      const prov = provinces.find(p => p.id === current.id);
      if (!prov) continue;

      for (const neighborId of prov.neighbors) {
        if (neighborId === targetId) {
          // Found path, return the second element (first step after start)
          const fullPath = [...current.path, neighborId];
          return fullPath[1];
        }

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, path: [...current.path, neighborId] });
        }
      }
    }

    // No path found (island or disconnected graph), stay put
    return startId;
  }, [provinces]);

  // Game Loop for Unit Movement (Only active when story is not blocking)
  useEffect(() => {
    if (provinces.length === 0 || isStoryActive) return;

    const intervalId = setInterval(() => {
      setUnits(currentUnits => {
        let hasChanges = false;
        
        const nextUnits = currentUnits.map(unit => {
          // If unit has a target and isn't there yet
          if (unit.targetProvinceId != null && unit.provinceId !== unit.targetProvinceId) {
             const nextStep = findNextStep(unit.provinceId, unit.targetProvinceId);
             
             // If valid move
             if (nextStep !== unit.provinceId) {
                 hasChanges = true;
                 return { ...unit, provinceId: nextStep };
             } else {
                 // Path blocked or invalid, clear target
                 hasChanges = true;
                 return { ...unit, targetProvinceId: null };
             }
          }
          // If arrived, clear target
          else if (unit.targetProvinceId != null && unit.provinceId === unit.targetProvinceId) {
             hasChanges = true;
             return { ...unit, targetProvinceId: null };
          }
          return unit;
        });

        return hasChanges ? nextUnits : currentUnits;
      });
    }, 1000); // Move every 1 second

    return () => clearInterval(intervalId);
  }, [provinces, findNextStep, isStoryActive]);

  const handleUnitsMove = (unitIds: string[], targetProvinceId: number) => {
    if (isStoryActive) return; // Prevent moves during story
    setUnits(prev => prev.map(u => {
        if (unitIds.includes(u.id)) {
            // Only set target, don't move immediately
            return { 
                ...u, 
                targetProvinceId: targetProvinceId 
            };
        }
        return u;
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden relative font-sans">
      
      {/* Story Overlay */}
      {isStoryActive && (
          <DialogueOverlay 
            script={CHAPTER_1_SCRIPT} 
            onComplete={() => setIsStoryActive(false)} 
          />
      )}

      {/* Main Map View */}
      <div className="flex-1 relative z-0">
         {provinces.length > 0 ? (
            <GameMap 
                provinces={provinces} 
                countryBorders={countryBorders}
                units={units}
                onSelectProvince={setSelectedProvinceId}
                onUnitsMove={handleUnitsMove}
                selectedProvinceId={selectedProvinceId}
            />
         ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500">Loading Theater Data...</div>
         )}
      </div>
      
      {/* Vignette Overlay for atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>
    </div>
  );
};

export default App;

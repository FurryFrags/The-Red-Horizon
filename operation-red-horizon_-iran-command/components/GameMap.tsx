
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Province, Faction, Unit, UnitType } from '../types';
import { Users, Activity, Shield } from 'lucide-react';

interface GameMapProps {
  provinces: Province[];
  countryBorders: Record<string, string>;
  units: Unit[];
  onSelectProvince: (id: number) => void;
  onUnitsMove: (unitIds: string[], targetProvinceId: number) => void;
  selectedProvinceId: number | null;
}

const getProvinceColor = (province: Province, isSelected: boolean) => {
  if (isSelected) return "#d97706"; // Amber-600
  
  switch (province.controller) {
    case Faction.NATO: return "#1e3a8a"; 
    case Faction.IRAN: return "#14532d"; 
    case Faction.KURDISTAN: return "#7c2d12"; 
    case Faction.NEUTRAL: return "#1f2937"; 
    default: return "#1f2937"; 
  }
};

const getUnitColor = (faction: Faction) => {
    switch (faction) {
        case Faction.NATO: return { fill: "#1d4ed8", stroke: "#93c5fd" }; // Blue
        case Faction.IRAN: return { fill: "#14532d", stroke: "#86efac" }; // Green
        case Faction.KURDISTAN: return { fill: "#7f1d1d", stroke: "#fca5a5" }; // Red
        default: return { fill: "#3f3f46", stroke: "#d4d4d8" }; // Gray
    }
}

// Stack Counter Component
const UnitStackCounter: React.FC<{ 
    count: number;
    faction: Faction;
    x: number; 
    y: number; 
    onMouseDown: (e: React.MouseEvent) => void; 
    isDraggingGlobal: boolean; 
    isSelected: boolean;
}> = ({ count, faction, x, y, onMouseDown, isDraggingGlobal, isSelected }) => {
    
    const colors = getUnitColor(faction);
    const isPlayerUnit = faction === Faction.NATO;

    return (
        <g 
            transform={`translate(${x - 14}, ${y - 10})`} 
            onMouseDown={isPlayerUnit ? onMouseDown : undefined}
            className={`${isDraggingGlobal ? 'pointer-events-none' : ''} ${isPlayerUnit ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ 
                filter: isSelected ? 'drop-shadow(0 0 4px #fbbf24)' : 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' 
            }}
        >
            {/* Counter Body */}
            <rect x="0" y="0" width="28" height="18" fill={colors.fill} stroke={isSelected ? "#fbbf24" : colors.stroke} strokeWidth={isSelected ? "2" : "1.5"} />
            
            {/* Standard "X" Symbol (Infantry Style) */}
            <g stroke="white" strokeWidth="1.5" opacity="0.6">
                <line x1="0" y1="0" x2="28" y2="18" />
                <line x1="0" y1="18" x2="28" y2="0" />
            </g>

            {/* Count Badge */}
            {count > 1 && (
                 <g transform="translate(20, -6)">
                     <circle r="8" fill="#111" stroke={colors.stroke} strokeWidth="1" />
                     <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{count}</text>
                 </g>
            )}

            {/* Stats Bars (Visual decoration) */}
            <rect x="-3" y="2" width="2" height="14" fill="#22c55e" /> 
            <rect x="29" y="2" width="2" height="14" fill="#f97316" />
        </g>
    );
};

const GameMap: React.FC<GameMapProps> = ({ 
    provinces, 
    countryBorders, 
    units, 
    onSelectProvince, 
    onUnitsMove,
    selectedProvinceId
}) => {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 2000, h: 1200 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  
  // Dragging Units State
  const [dragCurrentSVGPos, setDragCurrentSVGPos] = useState<{x: number, y: number} | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<number | null>(null);
  
  // Selection & Stacking
  const [selectedStack, setSelectedStack] = useState<{provinceId: number, faction: Faction} | null>(null);
  const [moveCount, setMoveCount] = useState<number>(1);
  const [isDraggingStack, setIsDraggingStack] = useState(false);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Group units by province and faction
  const unitsByStack = useMemo(() => {
    const map: Record<string, Unit[]> = {};
    units.forEach(u => {
        const key = `${u.provinceId}-${u.faction}`;
        if (!map[key]) map[key] = [];
        map[key].push(u);
    });
    return map;
  }, [units]);

  // Selected Units Helpers
  const selectedUnitsList = useMemo(() => {
    if (!selectedStack) return [];
    const key = `${selectedStack.provinceId}-${selectedStack.faction}`;
    return unitsByStack[key] || [];
  }, [selectedStack, unitsByStack]);

  const movingUnitsSubset = useMemo(() => {
     return selectedUnitsList.slice(0, moveCount);
  }, [selectedUnitsList, moveCount]);

  const subsetStats = useMemo(() => {
      if (movingUnitsSubset.length === 0) return { hp: 0, org: 0 };
      const totalStr = movingUnitsSubset.reduce((sum, u) => sum + u.strength, 0);
      const totalOrg = movingUnitsSubset.reduce((sum, u) => sum + u.organization, 0);
      return {
          hp: Math.round(totalStr / movingUnitsSubset.length),
          org: Math.round(totalOrg / movingUnitsSubset.length)
      };
  }, [movingUnitsSubset]);

  // Reset move count when selection changes
  useEffect(() => {
      if (selectedUnitsList.length > 0) {
          setMoveCount(selectedUnitsList.length);
      }
  }, [selectedUnitsList.length]);

  const getSVGPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    // @ts-ignore
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if(e.button === 0) {
        setIsDraggingMap(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
    // Deselect stack if clicking on empty map
    if (e.target === e.currentTarget || (e.target as Element).tagName === 'svg') {
        setSelectedStack(null);
    }
  };

  const handleStackMouseDown = (e: React.MouseEvent, provinceId: number, faction: Faction) => {
      e.stopPropagation();
      // Select this stack
      if (selectedStack?.provinceId !== provinceId || selectedStack?.faction !== faction) {
          setSelectedStack({ provinceId, faction });
          // Move count will auto-update via useEffect
      }
      
      // Start Dragging
      setIsDraggingStack(true);
      const pt = getSVGPoint(e.clientX, e.clientY);
      setDragCurrentSVGPos({ x: pt.x, y: pt.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingStack) {
        const svgPt = getSVGPoint(e.clientX, e.clientY);
        setDragCurrentSVGPos({ x: svgPt.x, y: svgPt.y });
        return;
    }

    if (isDraggingMap) {
        const dx = (e.clientX - lastMousePos.current.x) * (viewBox.w / svgRef.current!.clientWidth);
        const dy = (e.clientY - lastMousePos.current.y) * (viewBox.h / svgRef.current!.clientHeight);
        setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDraggingMap(false);
    
    if (isDraggingStack) {
        if (hoveredProvinceId && selectedStack) {
            // Find units to move
            const unitsToMove = selectedUnitsList.slice(0, moveCount).map(u => u.id);
            if (unitsToMove.length > 0) {
                onUnitsMove(unitsToMove, hoveredProvinceId);
            }
        }
        setIsDraggingStack(false);
        setDragCurrentSVGPos(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    const w = viewBox.w * scale;
    const h = viewBox.h * scale;
    const x = viewBox.x + (viewBox.w - w) / 2;
    const y = viewBox.y + (viewBox.h - h) / 2;
    setViewBox({ x, y, w, h });
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDraggingStack, hoveredProvinceId, selectedStack, moveCount, selectedUnitsList]);

  const provincesByCountry: Record<string, Province[]> = {};
  provinces.forEach(p => {
      if (!provincesByCountry[p.country]) provincesByCountry[p.country] = [];
      provincesByCountry[p.country].push(p);
  });

  // Calculate drag line start
  let dragLineStart = null;
  if (isDraggingStack && selectedStack) {
      const p = provinces.find(prov => prov.id === selectedStack.provinceId);
      if (p) dragLineStart = p.center;
  }

  return (
    <div 
        className="flex-1 relative bg-[#050505] overflow-hidden w-full h-full cursor-move select-none"
        onContextMenu={(e) => e.preventDefault()}
    >
        <svg
            ref={svgRef}
            className="w-full h-full block"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            preserveAspectRatio="xMidYMid slice"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
        >
            <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                </pattern>
                {Object.entries(countryBorders).map(([country, path]) => (
                    <clipPath id={`clip-${country}`} key={country}>
                        <path d={path} />
                    </clipPath>
                ))}
            </defs>

            <rect x="-4000" y="-4000" width="12000" height="12000" fill="#0f172a" />
            <rect x="-4000" y="-4000" width="12000" height="12000" fill="url(#grid)" />

            {/* Countries & Provinces */}
            {Object.entries(provincesByCountry).map(([country, countryProvinces]) => (
                <g key={country}>
                    <path d={countryBorders[country]} fill="#1f2937" />
                    <g clipPath={`url(#clip-${country})`}>
                        {countryProvinces.map(province => {
                            const isSelected = selectedProvinceId === province.id;
                            const isHoveredTarget = isDraggingStack && hoveredProvinceId === province.id;
                            let fill = getProvinceColor(province, isSelected);
                            if (isHoveredTarget) fill = "#4d7c0f"; 

                            return (
                                <path
                                    key={province.id}
                                    d={province.path}
                                    fill={fill}
                                    stroke="#000" 
                                    strokeWidth={isHoveredTarget ? "2" : "0.5"}
                                    strokeOpacity={isHoveredTarget ? "1" : "0.3"}
                                    className="transition-colors duration-75"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectProvince(province.id);
                                    }}
                                    onMouseEnter={() => setHoveredProvinceId(province.id)}
                                    onMouseLeave={() => {
                                        if (hoveredProvinceId === province.id) setHoveredProvinceId(null);
                                    }}
                                />
                            );
                        })}
                    </g>
                    <path 
                        d={countryBorders[country]} 
                        fill="none" 
                        stroke="#000"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 2px black)' }}
                    />
                </g>
            ))}

            {/* Drag Line */}
            {isDraggingStack && dragLineStart && dragCurrentSVGPos && (
                <g pointerEvents="none">
                    <line 
                        x1={dragLineStart[0]} 
                        y1={dragLineStart[1]} 
                        x2={dragCurrentSVGPos.x} 
                        y2={dragCurrentSVGPos.y} 
                        stroke="#fbbf24" 
                        strokeWidth="2" 
                        strokeDasharray="4 2"
                    />
                    <circle cx={dragCurrentSVGPos.x} cy={dragCurrentSVGPos.y} r="4" fill="#fbbf24" />
                    {/* Floating Counter while dragging */}
                    <text 
                        x={dragCurrentSVGPos.x + 10} 
                        y={dragCurrentSVGPos.y - 10} 
                        fill="white" 
                        fontWeight="bold" 
                        fontSize="12"
                        style={{ textShadow: '0 1px 2px black' }}
                    >
                        {moveCount} Divs
                    </text>
                </g>
            )}

            {/* Units Stacks */}
            {Object.entries(unitsByStack).map(([key, stackUnits]) => {
                if (stackUnits.length === 0) return null;
                const unit = stackUnits[0];
                const prov = provinces.find(p => p.id === unit.provinceId);
                if (!prov) return null;

                const isSelected = selectedStack?.provinceId === unit.provinceId && selectedStack?.faction === unit.faction;

                // Simple offset for different factions in same province to prevent total overlap
                const factionOffset = unit.faction === Faction.NATO ? -5 : (unit.faction === Faction.IRAN ? 5 : 0);

                return (
                    <UnitStackCounter 
                        key={key}
                        count={stackUnits.length}
                        faction={unit.faction}
                        x={prov.center[0] + factionOffset}
                        y={prov.center[1] + factionOffset}
                        isSelected={isSelected}
                        isDraggingGlobal={isDraggingStack}
                        onMouseDown={(e) => handleStackMouseDown(e, unit.provinceId, unit.faction)}
                    />
                );
            })}
        </svg>

        {/* Stack Slider UI */}
        {selectedStack && selectedUnitsList.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1e2329] border border-gray-600 rounded-lg shadow-2xl p-4 w-72 z-50 flex flex-col space-y-3"
                 onMouseDown={(e) => e.stopPropagation()} // Prevent map drag
            >
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-white font-bold text-sm">Army Selection</span>
                    <span className="text-xs text-blue-400 font-mono">NATO</span>
                </div>
                
                <div className="flex items-center space-x-4">
                     {/* Slider */}
                     <div className="flex-1 flex flex-col space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                             <span>Assign</span>
                             <span className="text-white font-bold">{moveCount} / {selectedUnitsList.length}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max={selectedUnitsList.length} 
                            value={moveCount} 
                            onChange={(e) => setMoveCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                </div>

                {/* Stats Display */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded">
                    <div className="flex items-center space-x-2">
                        <Shield size={16} className="text-orange-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase">Avg Str</span>
                            <span className="text-sm font-mono text-white">{subsetStats.hp}%</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Activity size={16} className="text-green-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase">Avg Org</span>
                            <span className="text-sm font-mono text-white">{subsetStats.org}%</span>
                        </div>
                    </div>
                </div>
                
                <div className="text-[10px] text-gray-500 text-center italic">
                    Drag unit stack to move selected amount
                </div>
            </div>
        )}
    </div>
  );
};

export default GameMap;

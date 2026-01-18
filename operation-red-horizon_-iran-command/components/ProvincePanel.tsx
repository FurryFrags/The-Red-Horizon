import React from 'react';
import { Province, Faction, TerrainType } from '../types';
import { Mountain, Tent, Building2, Warehouse, Anchor, Shield, Swords, Activity, Skull, MousePointer2 } from 'lucide-react';

interface ProvincePanelProps {
  province: Province | null;
  onUpdateProvince: (updated: Province) => void;
}

const FactionBadge: React.FC<{ faction: Faction }> = ({ faction }) => {
  let color = "bg-gray-600";
  if (faction === Faction.NATO) color = "bg-blue-600 border-blue-400";
  if (faction === Faction.IRAN) color = "bg-green-800 border-green-600";
  if (faction === Faction.KURDISTAN) color = "bg-orange-600 border-orange-400";
  if (faction === Faction.CHINA) color = "bg-red-600 border-red-400";
  if (faction === Faction.CSTO) color = "bg-red-800 border-red-500";

  return (
    <div className={`px-2 py-1 rounded border ${color} text-white text-xs font-bold shadow-sm inline-block`}>
      {faction}
    </div>
  );
};

const ProvincePanel: React.FC<ProvincePanelProps> = ({ province, onUpdateProvince }) => {
  if (!province) {
    return (
      <div className="w-80 h-[calc(100vh-3.5rem)] bg-[#1e2329]/95 border-r border-gray-600 p-4 text-gray-400 font-mono absolute left-0 top-14 z-10 backdrop-blur-sm flex flex-col items-center justify-center">
        <MousePointer2 className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-center">Select a province to view intelligence report and manage operations.</p>
      </div>
    );
  }

  const handleStatChange = (key: keyof Province, value: any) => {
    onUpdateProvince({ ...province, [key]: value });
  };

  const terrainIcon = {
    [TerrainType.PLAINS]: <Tent size={24} className="text-green-400" />,
    [TerrainType.DESERT]: <Tent size={24} className="text-yellow-600" />, // Using Tent as generic land
    [TerrainType.MOUNTAIN]: <Mountain size={24} className="text-gray-300" />,
    [TerrainType.HILLS]: <Mountain size={24} className="text-yellow-700" />,
    [TerrainType.URBAN]: <Building2 size={24} className="text-blue-400" />,
    [TerrainType.COASTAL_DESERT]: <Anchor size={24} className="text-yellow-200" />,
  }[province.terrain];

  return (
    <div className="w-80 h-[calc(100vh-3.5rem)] bg-[#1e2329] border-r border-gray-600 text-gray-200 font-sans shadow-2xl overflow-y-auto absolute left-0 top-14 z-10 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-600">
        <h2 className="text-xl font-bold font-mono text-white tracking-wider truncate">{province.name}</h2>
        <h3 className="text-sm text-yellow-500 font-semibold uppercase">{province.stateName}</h3>
      </div>

      {/* Terrain & Visual */}
      <div className="relative h-32 bg-gray-900 flex items-center justify-center overflow-hidden border-b border-gray-600">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
        <div className="z-10 flex flex-col items-center">
            {terrainIcon}
            <span className="text-sm font-bold mt-2 text-gray-400 uppercase tracking-widest">{province.terrain}</span>
        </div>
        {province.isCoastal && <div className="absolute bottom-2 right-2"><Anchor size={16} className="text-cyan-500"/></div>}
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4 flex-1">
        
        {/* Ownership */}
        <div className="space-y-2 mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase">Owner</span>
            <FactionBadge faction={province.owner} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase">Controller</span>
            <FactionBadge faction={province.controller} />
          </div>
        </div>

        {/* Action Buttons (Change State) */}
        <div className="grid grid-cols-2 gap-2 mb-4">
           <button 
             onClick={() => handleStatChange('controller', Faction.NATO)}
             className="bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 text-blue-200 text-xs py-2 px-1 rounded transition-colors"
            >
             Occupy (NATO)
           </button>
           <button 
             onClick={() => handleStatChange('controller', Faction.KURDISTAN)}
             className="bg-orange-900/40 hover:bg-orange-800/60 border border-orange-700 text-orange-200 text-xs py-2 px-1 rounded transition-colors"
            >
             Incile Revolt
           </button>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
            <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Activity size={16} className="text-green-500"/>
                    <span className="text-sm">Infrastructure</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="font-mono text-yellow-400">{province.infrastructure}/10</span>
                    <button 
                        onClick={() => handleStatChange('infrastructure', Math.min(10, province.infrastructure + 1))}
                        className="w-5 h-5 bg-gray-700 hover:bg-green-700 text-white flex items-center justify-center text-xs rounded border border-gray-500"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Building2 size={16} className="text-cyan-400"/>
                    <span className="text-sm">Factories</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="font-mono text-white">{province.factories}</span>
                     <button 
                        onClick={() => handleStatChange('factories', province.factories + 1)}
                        className="w-5 h-5 bg-gray-700 hover:bg-cyan-700 text-white flex items-center justify-center text-xs rounded border border-gray-500"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Shield size={16} className="text-gray-400"/>
                    <span className="text-sm">Forts</span>
                </div>
                <span className="font-mono text-white">0/10</span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-700 pt-2 mt-2">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Warehouse size={16} className="text-orange-300"/>
                    <span className="text-sm">Supply Limit</span>
                </div>
                <span className="font-mono text-white">{province.supplyLimit}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Skull size={16} className="text-red-400"/>
                    <span className="text-sm">Resistance</span>
                </div>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div style={{width: `${province.resistance}%`}} className="h-full bg-red-600"></div>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2 text-gray-300">
                    <Swords size={16} className="text-blue-300"/>
                    <span className="text-sm">Manpower</span>
                </div>
                <span className="font-mono text-white">{(province.manpower/1000).toFixed(1)}K</span>
            </div>
        </div>
      </div>

      {/* Footer / Province ID */}
      <div className="p-2 bg-black/40 text-center text-[10px] text-gray-600 font-mono">
        PROV_ID: {province.id} | REGION_HEX: {province.center[0].toFixed(0)}-{province.center[1].toFixed(0)}
      </div>
    </div>
  );
};

export default ProvincePanel;


import React from 'react';
import { ArmyGroup, Unit } from '../types';
import { Shield, Target, Swords, Skull } from 'lucide-react';

interface ArmyGroupBarProps {
  armyGroups: ArmyGroup[];
  units: Unit[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
}

const ArmyGroupBar: React.FC<ArmyGroupBarProps> = ({ armyGroups, units, selectedGroupId, onSelectGroup }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-24 bg-[#111] border-t-4 border-[#333] flex items-center px-4 space-x-4 z-50 shadow-2xl select-none">
      
      {/* Army Groups Cards (Now aligned left since CMD area removed) */}
      <div className="flex space-x-3 overflow-x-auto pb-1 items-end h-full py-2 ml-4">
        {armyGroups.map((group, idx) => {
          const groupUnits = units.filter(u => u.armyGroupId === group.id);
          const isSelected = selectedGroupId === group.id;
          
          // Calculate stats
          const avgOrg = groupUnits.reduce((acc, u) => acc + u.organization, 0) / (groupUnits.length || 1);
          const avgStr = groupUnits.reduce((acc, u) => acc + u.strength, 0) / (groupUnits.length || 1);

          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`relative group flex flex-col items-center transition-all duration-150 ${isSelected ? '-translate-y-2' : 'hover:-translate-y-1'}`}
            >
              {/* Portrait Box */}
              <div 
                className={`w-14 h-16 bg-gradient-to-b from-gray-700 to-gray-800 border-2 relative shadow-lg ${isSelected ? 'border-yellow-500 shadow-yellow-500/20' : 'border-gray-500'}`}
              >
                {/* Silhouette / Portrait Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <Skull size={32} />
                </div>
                
                {/* Name Tag */}
                <div className="absolute bottom-0 left-0 w-full bg-black/80 text-[9px] text-white text-center font-mono py-0.5 truncate px-1 border-t border-gray-600">
                    {group.commanderName.split(' ').pop()}
                </div>
                
                {/* Selection Highlight Corner */}
                {isSelected && <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 clip-triangle"></div>}
              </div>

              {/* Unit Count Badge */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 border border-gray-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow z-10">
                {groupUnits.length}
              </div>

              {/* Org/Str Bars */}
              <div className="w-14 mt-1 space-y-[1px]">
                  <div className="h-1 w-full bg-gray-800 border border-black/50">
                      <div className="h-full bg-green-600" style={{ width: `${avgOrg}%` }}></div>
                  </div>
                  <div className="h-1 w-full bg-gray-800 border border-black/50">
                      <div className="h-full bg-orange-500" style={{ width: `${avgStr}%` }}></div>
                  </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Orders Panel (Visual Only) */}
      <div className="flex-1 flex justify-end items-center space-x-1 opacity-60 pointer-events-none">
          <div className="h-10 w-10 border border-gray-600 bg-gray-800/50 rounded flex items-center justify-center"><Swords size={16}/></div>
          <div className="h-10 w-10 border border-gray-600 bg-gray-800/50 rounded flex items-center justify-center"><Target size={16}/></div>
      </div>
    </div>
  );
};

export default ArmyGroupBar;

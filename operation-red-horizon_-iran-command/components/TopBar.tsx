import React from 'react';
import { GameState } from '../types';
import { Anchor, Zap, Users, Factory, Gauge, Flag, Skull, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  gameState: GameState;
}

const ResourceItem: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color?: string }> = ({ icon, value, label, color = "text-gray-200" }) => (
  <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-600 px-3 py-1 rounded shadow-inner min-w-[100px] justify-center tooltip-container group relative cursor-default">
    <span className={`${color}`}>{icon}</span>
    <span className="font-mono font-bold text-sm text-white">{value}</span>
    <div className="absolute top-full mt-1 hidden group-hover:block bg-black text-xs p-2 z-50 whitespace-nowrap border border-gray-500">
        {label}
    </div>
  </div>
);

const TopBar: React.FC<TopBarProps> = ({ gameState }) => {
  return (
    <div className="w-full h-14 bg-gradient-to-b from-slate-900 to-slate-800 border-b-2 border-slate-600 flex items-center px-4 justify-between select-none shadow-lg z-20">
      {/* Left: Flag & Tension */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-10 h-8 bg-blue-700 border-2 border-yellow-500 shadow-md flex items-center justify-center text-white text-xs font-bold">
            NATO
          </div>
        </div>
        <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Global Tension</span>
            <div className="flex items-center space-x-2">
                <div className="w-24 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-600 relative">
                    <div 
                        className="h-full bg-red-600 transition-all duration-1000" 
                        style={{ width: `${gameState.tension}%` }}
                    ></div>
                    {gameState.tension > 80 && <span className="animate-ping absolute right-0 top-0 h-full w-2 bg-red-400 rounded-full"></span>}
                </div>
                <span className="text-red-500 font-bold text-sm">{gameState.tension}%</span>
            </div>
        </div>
      </div>

      {/* Center: Resources */}
      <div className="flex items-center space-x-2">
        <ResourceItem icon={<Anchor size={16} />} value={gameState.politicalPower} label="Political Power" color="text-yellow-400" />
        <ResourceItem icon={<Zap size={16} />} value={`${gameState.stability}%`} label="Stability" color="text-amber-600" />
        <ResourceItem icon={<Flag size={16} />} value={`${gameState.warSupport}%`} label="War Support" color="text-green-500" />
        <ResourceItem icon={<Users size={16} />} value={(gameState.manpower / 1000).toFixed(1) + 'K'} label="Manpower" color="text-yellow-100" />
        <ResourceItem icon={<Factory size={16} />} value={gameState.factories} label="Factories" color="text-cyan-400" />
      </div>

      {/* Right: XP and Date */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1">
             <div className="px-2 py-0.5 bg-green-900/50 border border-green-700 text-green-200 text-xs font-mono">★ {gameState.armyExperience}</div>
             <div className="px-2 py-0.5 bg-blue-900/50 border border-blue-700 text-blue-200 text-xs font-mono">⚓ {gameState.navyExperience}</div>
             <div className="px-2 py-0.5 bg-sky-900/50 border border-sky-700 text-sky-200 text-xs font-mono">✈ {gameState.airExperience}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-500 px-4 py-2 rounded text-white font-mono font-bold tracking-wider shadow-inner">
            {gameState.date}
        </div>
        
        <div className="flex space-x-1">
            <button className="w-8 h-8 bg-slate-700 rounded border border-slate-500 hover:bg-slate-600 flex items-center justify-center text-white">||</button>
            <button className="w-8 h-8 bg-slate-700 rounded border border-slate-500 hover:bg-slate-600 flex items-center justify-center text-white">▶</button>
            <button className="w-8 h-8 bg-slate-700 rounded border border-slate-500 hover:bg-slate-600 flex items-center justify-center text-white">▶▶</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

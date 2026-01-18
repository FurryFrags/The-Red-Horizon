
import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../story/script';
import { User, ShieldAlert, Skull, Mic2, Play } from 'lucide-react';

interface DialogueOverlayProps {
  script: DialogueLine[];
  onComplete: () => void;
}

const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ script, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentLine = script[currentIndex];

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;
    const fullText = currentLine.text;

    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25); // Slightly faster typing

    return () => clearInterval(interval);
  }, [currentIndex, currentLine]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      if (currentIndex < script.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  const renderPortrait = (line: DialogueLine) => {
    if (line.characterId === 'System') return null;

    if (line.imagePath) {
        return (
            <div className={`
                relative
                transition-all duration-500
                ${line.characterId === 'Ally' ? 'mr-auto' : 'ml-auto'}
            `}
            style={{ 
                width: '400px', 
                height: '600px',
            }}
            >
                <img 
                    src={line.imagePath} 
                    alt={line.displayName} 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                        const target = e.currentTarget;
                        // Attempt fallback to just "Neutral.png" in the same folder if specific mood fails
                        if (!target.src.endsWith('Neutral.png')) {
                            // Replace filename with Neutral.png
                            const srcParts = target.src.split('/');
                            srcParts.pop();
                            const newSrc = srcParts.join('/') + '/Neutral.png';
                            target.src = newSrc;
                        } else {
                            // If Neutral.png also fails, hide image and show icon fallback
                            target.style.display = 'none';
                            target.parentElement?.classList.add('flex', 'items-end', 'justify-center');
                            const iconDiv = document.getElementById(`fallback-icon-${line.id}`);
                            if (iconDiv) iconDiv.style.display = 'flex';
                        }
                    }}
                />
                
                {/* Fallback Icon Container (Hidden by default) */}
                <div id={`fallback-icon-${line.id}`} className="absolute bottom-0 w-full h-3/4 items-end justify-center hidden pb-10">
                   {line.characterId === 'Ally' && <User size={200} className="text-blue-500 opacity-80" />}
                   {line.characterId === 'Iranian' && <Skull size={200} className="text-green-500 opacity-80" />}
                   {line.characterId === 'Russian' && <ShieldAlert size={200} className="text-red-500 opacity-80" />}
                   {line.characterId === 'Chinese' && <Mic2 size={200} className="text-red-500 opacity-80" />}
                </div>
            </div>
        );
    }
    return null;
  };

  if (currentLine.position === 'center') {
      return (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md cursor-pointer"
            onClick={handleNext}
          >
              <div className="bg-red-950/90 border-y-4 border-red-600 p-12 max-w-3xl text-center shadow-[0_0_100px_rgba(220,38,38,0.6)]">
                  <h2 className="text-4xl font-bold text-red-100 font-mono tracking-[0.2em] animate-pulse mb-6">{currentLine.displayName}</h2>
                  <p className="text-2xl text-white font-mono leading-relaxed">{displayedText}</p>
                  <div className="mt-12 text-sm text-red-400 animate-bounce tracking-widest uppercase">Click to advance</div>
              </div>
          </div>
      );
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Cinematic Vignette & Darkener */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>

      {/* Character Stage */}
      <div className="absolute inset-0 flex items-end justify-between px-0 pb-0 overflow-hidden">
        
        {/* Left Stage (Ally) */}
        <div className={`
            relative z-10 transition-all duration-300 transform origin-bottom-left
            ${(currentLine.characterId === 'Ally' || currentLine.position === 'left') 
                ? 'translate-x-0 opacity-100 scale-100 filter brightness-100 grayscale-0' 
                : '-translate-x-20 opacity-0 scale-90 filter brightness-50 grayscale'}
        `}>
             {(currentLine.characterId === 'Ally' || currentLine.position === 'left') && renderPortrait(currentLine)}
        </div>

        {/* Right Stage (Others) */}
        <div className={`
            relative z-10 transition-all duration-300 transform origin-bottom-right
            ${(currentLine.characterId !== 'Ally' && currentLine.position === 'right') 
                ? 'translate-x-0 opacity-100 scale-100 filter brightness-100 grayscale-0' 
                : 'translate-x-20 opacity-0 scale-90 filter brightness-50 grayscale'}
        `}>
             {(currentLine.characterId !== 'Ally' && currentLine.position === 'right') && renderPortrait(currentLine)}
        </div>
      </div>

      {/* Dialogue Interface */}
      <div className="absolute bottom-0 left-0 w-full z-50 flex flex-col items-center pointer-events-auto cursor-pointer" onClick={handleNext}>
          
          {/* Name Tag Plate */}
          <div className="w-full max-w-5xl flex px-10 mb-[-2px] relative z-20">
             <div className={`
                px-8 py-2 border-t-2 border-x-2 transform skew-x-12 origin-bottom-left shadow-lg
                ${currentLine.characterId === 'Ally' ? 'bg-blue-900/90 border-blue-400' : ''}
                ${currentLine.characterId === 'Iranian' ? 'bg-green-900/90 border-green-400' : ''}
                ${currentLine.characterId === 'Russian' ? 'bg-red-900/90 border-red-400' : ''}
                ${currentLine.characterId === 'Chinese' ? 'bg-red-950/90 border-red-500' : ''}
             `}>
                 <span className={`
                    block transform -skew-x-12 text-2xl font-bold font-mono tracking-widest text-white uppercase drop-shadow-md
                 `}>
                    {currentLine.displayName}
                 </span>
             </div>
          </div>

          {/* Text Box */}
          <div className="w-full h-56 bg-gradient-to-b from-[#1a1a1a] to-black border-t-4 border-gray-500 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="container mx-auto max-w-5xl px-12 py-8 h-full relative">
                  <p className="text-2xl text-gray-100 font-serif leading-relaxed tracking-wide drop-shadow-md">
                      {displayedText}
                      <span className="animate-pulse inline-block w-3 h-6 bg-gray-400 ml-1 align-middle"></span>
                  </p>
                  
                  <div className="absolute bottom-6 right-10 flex items-center space-x-2 text-gray-500 text-sm font-mono opacity-70 hover:opacity-100 transition-opacity">
                      <span>NEXT</span>
                      <Play size={14} className="fill-current"/>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DialogueOverlay;

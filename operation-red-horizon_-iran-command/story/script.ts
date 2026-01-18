
export interface DialogueLine {
  id: number;
  characterId: 'Ally' | 'Russian' | 'Chinese' | 'Iranian' | 'System';
  displayName: string;
  text: string;
  position: 'left' | 'right' | 'center';
  imagePath?: string;
}

// Helper to construct image paths based simply on Folder + Filename
// Example: getImg('CharChina', 'Gun') -> '/CharChina/Gun.png'
const getImg = (folder: string, filename: string) => {
  return `/${folder}/${filename}.png`;
};

export const CHAPTER_1_SCRIPT: DialogueLine[] = [
    // --- INTRO ---
    { 
      id: 1, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Welcome to High Command, Commander. I've reviewed your file. Your work in the Pacific was exemplary.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Happy') 
    },
    { 
      id: 2, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "You've been cleared for Operation Red Horizon. But before we hand over the nuclear codes, we need to run a calibration drill.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Neutral') 
    },
    
    // --- POLAND DRILL ---
    { 
      id: 3, 
      characterId: 'System', 
      displayName: 'SYSTEM ALERT', 
      text: "LOADING SIMULATION: EASTERN POLAND BORDER...", 
      position: 'center' 
    },
    { 
      id: 4, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "This is a live-fire exercise. Imagine these are the Polish plains. We've deployed dummy targets marked with training flags.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Serious') 
    },
    { 
      id: 5, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Keep a sharp eye on the Belarus border. Satellite recon shows the Russian garrison in Lithuania is active. They're watching us.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Suspicious') 
    },

    // --- IRAN CONTEXT ---
    { 
      id: 6, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Simulation complete. Let's talk about the real threat. Sector: Iran.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Serious') 
    },
    { 
      id: 7, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "The Regime is collapsing. The people are starving, and the military is fracturing. It is total chaos down there.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Neutral') 
    },
    { 
      id: 8, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Your primary objective is the North-West. The Kurdish independence forces are holding out, but they need support immediately.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Neutral') 
    },
    
    // --- MISSIONS ---
    { 
      id: 9, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Secure the mountains. If we lose Kurdistan, we lose our foothold in the region.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Serious') 
    },
    { 
      id: 10, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Intel suggests China is funneling nuclear components through the north-east. We must intercept those convoys before they reach the silos.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Suspicious') 
    },
    { 
      id: 11, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Don't expect help from the neighbors. Iraq and Afghanistan have closed their borders. We are operating in isolation.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Neutral') 
    },

    // --- ANTAGONISTS SCENE ---
    { 
      id: 12, 
      characterId: 'Iranian', 
      displayName: 'Gen. Farhadi', 
      text: "They are moving too fast! My northern division has shattered! We cannot hold the mountain passes!", 
      position: 'right', 
      imagePath: getImg('CharIran', 'Angry')
    },
    { 
      id: 13, 
      characterId: 'Russian', 
      displayName: 'Col. Volkov', 
      text: "Stop your whining, General. Let the Americans overextend. They are walking into a trap.", 
      position: 'right', 
      imagePath: getImg('CharRussia', 'Dismissive')
    },
    { 
      id: 14, 
      characterId: 'Chinese', 
      displayName: 'Minister Zhang', 
      text: "Precisely. The deeper they march, the harder it will be for them to retreat when the snow falls.", 
      position: 'right', 
      imagePath: getImg('CharChina', 'Neutral')
    },
    { 
      id: 15, 
      characterId: 'Iranian', 
      displayName: 'Gen. Farhadi', 
      text: "You speak of strategy while my cities burn?! I demanded armor support weeks ago! Where are your tanks?!", 
      position: 'right', 
      imagePath: getImg('CharIran', 'Angry')
    },
    { 
      id: 16, 
      characterId: 'Chinese', 
      displayName: 'Minister Zhang', 
      text: "Your army has served its purpose, General. You have bought us the time we needed.", 
      position: 'right', 
      imagePath: getImg('CharChina', 'Suspicious')
    },
    { 
      id: 17, 
      characterId: 'Chinese', 
      displayName: 'Minister Zhang', 
      text: "We will take command of your remaining assets now.", 
      position: 'right', 
      imagePath: getImg('CharChina', 'Gun')
    },
    { 
      id: 18, 
      characterId: 'System', 
      displayName: '', 
      text: "*GUNSHOT*", 
      position: 'center' 
    },
    
    // --- FINALE ---
    { 
      id: 19, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "Commander! High alert! We just detected a massive energy signature. Something has changed.", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Suspicious')
    },
    { 
      id: 20, 
      characterId: 'Ally', 
      displayName: 'Cmdr. Ally', 
      text: "The Chinese artillery is unmasking. They aren't hiding anymore. Defend the line at all costs!", 
      position: 'left', 
      imagePath: getImg('CharAlly', 'Serious') 
    },
];

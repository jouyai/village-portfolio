'use client';

import { useState, useEffect, useRef } from 'react';

// --- CONFIG SPRITE ---
const SPRITE_CONFIG = {
  img: '/assets/env/Citizen2_Walk.png',
  cols: 6,
  rows: 4,
  scale: '600% 400%',
};

interface CitizenData {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: 'down' | 'right' | 'up' | 'left';
  speed: number;
  frame: number;
  frameTimer: number;
}

const WALK_AREA = {
  minX: 50, maxX: 900,
  minY: 450, maxY: 750
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getNewTarget = () => ({
  x: getRandomInt(WALK_AREA.minX, WALK_AREA.maxX),
  y: getRandomInt(WALK_AREA.minY, WALK_AREA.maxY),
});

export default function Home() {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [citizens, setCitizens] = useState<CitizenData[]>([]);
  const requestRef = useRef<number | null>(null);

  const handleBuildingClick = (projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(projectName);
  };

  const handleClose = () => setActiveProject(null);

  const pixelStyle = { imageRendering: 'pixelated' } as const;

  // --- SPAWN CITIZEN ---
  useEffect(() => {
    const initialCitizens: CitizenData[] = Array.from({ length: 6 }).map((_, index) => {
      const startPos = getNewTarget();
      const targetPos = getNewTarget();
      return {
        id: index,
        x: startPos.x,
        y: startPos.y,
        targetX: targetPos.x,
        targetY: targetPos.y,
        direction: 'down',
        speed: getRandomInt(30, 60) / 100,
        frame: getRandomInt(0, 5),
        frameTimer: 0,
      };
    });
    setCitizens(initialCitizens);
  }, []);

  // --- GAME LOOP ---
  const updateCitizens = () => {
    setCitizens((prevCitizens) =>
      prevCitizens.map((citizen) => {
        let newFrame = citizen.frame;
        let newFrameTimer = citizen.frameTimer + 1;

        if (newFrameTimer > 6) {
          newFrame = (citizen.frame + 1) % 6;
          newFrameTimer = 0;
        }

        const dx = citizen.targetX - citizen.x;
        const dy = citizen.targetY - citizen.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          const newTarget = getNewTarget();
          return {
            ...citizen,
            targetX: newTarget.x,
            targetY: newTarget.y,
          };
        }

        const moveX = (dx / distance) * citizen.speed;
        const moveY = (dy / distance) * citizen.speed;

        let newDirection = citizen.direction;
        if (Math.abs(moveX) > Math.abs(moveY)) {
          newDirection = moveX > 0 ? 'right' : 'left';
        } else {
          newDirection = moveY > 0 ? 'down' : 'up';
        }

        return {
          ...citizen,
          x: citizen.x + moveX,
          y: citizen.y + moveY,
          direction: newDirection,
          frame: newFrame,
          frameTimer: newFrameTimer
        };
      })
    );
    requestRef.current = requestAnimationFrame(updateCitizens);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateCitizens);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- CITIZEN RENDERER ---
  const CitizenRenderer = ({ data }: { data: CitizenData }) => {
    const backgroundX = `${data.frame * 20}%`;
    let backgroundY = '0%';
    let flipStyle = 'scaleX(1)';

    if (data.direction === 'down') { backgroundY = '0%'; }
    else if (data.direction === 'right') { backgroundY = '33.33%'; flipStyle = 'scaleX(-1)'; }
    else if (data.direction === 'up') { backgroundY = '66.66%'; }
    else if (data.direction === 'left') { backgroundY = '33.33%'; flipStyle = 'scaleX(1)'; }

    return (
      <div className="absolute pointer-events-none z-15 flex items-end justify-center"
        style={{ left: Math.round(data.x), top: Math.round(data.y), width: '48px', height: '48px', transform: `translate(-50%, -50%)` }}>
        <div className="absolute bottom-1 w-6 h-2 bg-black/30 rounded-full blur-[2px]" />
        <div style={{
          width: '100%', height: '100%',
          backgroundImage: `url('${SPRITE_CONFIG.img}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: SPRITE_CONFIG.scale,
          backgroundPosition: `${backgroundX} ${backgroundY}`,
          imageRendering: 'pixelated',
          transform: flipStyle,
        }}
        />
      </div>
    );
  };

  // --- MAP ITEM (RUMAH & POHON) ---
  const MapItem = ({ type, x, y, label, onClick }: any) => {
    let src = '', width = '', zIndex = 'z-10';
    if (type === 'house') { src = '/assets/env/house_topdown.png'; width = 'w-[160px]'; zIndex = 'z-20'; }
    if (type === 'tree') { src = '/assets/env/tree_topdown.png'; width = 'w-[90px]'; }

    const isInteractive = !!onClick;

    return (
      <div
        className={`absolute flex flex-col items-center group ${width} ${zIndex} ${isInteractive ? 'cursor-pointer' : 'pointer-events-none'}`}
        style={{ left: x, top: y }}
        onClick={onClick}
      >

        {label && (
          <div className="animate-bounce z-50 mb-2">
            <div className="bg-[#fff1e8] border-2 border-[#5d4037] px-3 py-2 rounded-lg font-bold shadow-lg whitespace-nowrap text-[8px] md:text-[10px] text-[#5d4037] tracking-widest hover:bg-[#ffccaa] transition-colors">
              ▼ {label}
            </div>
          </div>
        )}

        <img
          src={src}
          className={`w-full drop-shadow-[0_8px_5px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out will-change-transform
            ${isInteractive ? 'group-hover:scale-110 group-hover:-translate-y-2' : ''}
          `}
          style={pixelStyle}
        />
      </div>
    );
  };

  const RoadItem = ({ type, x, y }: any) => {
    const typeMap: any = { 'h': '/assets/env/road_h.png', 'v': '/assets/env/road_v.png', 'tl': '/assets/env/road_tl.png', 'tr': '/assets/env/road_tr.png', 'bl': '/assets/env/road_bl.png', 'br': '/assets/env/road_br.png', 't-up': '/assets/env/road_t_up.png' };
    const src = typeMap[type] || typeMap['h'];
    return (<img src={src} className="absolute w-[128px] h-[128px] pointer-events-none z-0 opacity-90" style={{ left: x, top: y, ...pixelStyle }} alt="road" />);
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#2d5a2d] relative text-sm flex items-center justify-center selection:bg-[#5d4037] selection:text-white" style={{ backgroundImage: "url('/assets/env/grass_tile.png')", backgroundRepeat: 'repeat', backgroundSize: '128px', imageRendering: 'pixelated' }}>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-[#fff1e8] border-4 border-[#5d4037] text-[#5d4037] px-6 py-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] pointer-events-none">
        <h1 className="text-sm md:text-xl font-bold tracking-widest uppercase flex items-center gap-2 drop-shadow-sm">MY VILLAGE</h1>
      </div>
      <div className="relative w-[1000px] h-[800px] shrink-0 origin-center scale-[0.45] sm:scale-75 md:scale-100 transition-transform duration-500 ease-out">
        <RoadItem type="tl" x="50px" y="650px" /><RoadItem type="t-up" x="178px" y="650px" /><RoadItem type="h" x="306px" y="650px" /><RoadItem type="t-up" x="434px" y="650px" /><RoadItem type="h" x="562px" y="650px" /><RoadItem type="t-up" x="690px" y="650px" /><RoadItem type="tr" x="818px" y="650px" /><RoadItem type="v" x="50px" y="778px" /><RoadItem type="v" x="818px" y="778px" />

        {citizens.map((citizen) => (<CitizenRenderer key={citizen.id} data={citizen} />))}

        <MapItem type="house" x="148px" y="415px" label="ABOUT ME" onClick={(e: any) => handleBuildingClick('ABOUT', e)} />
        <MapItem type="house" x="404px" y="415px" label="MY PROJECTS" onClick={(e: any) => handleBuildingClick('WEB_PROJECTS', e)} />
        <MapItem type="house" x="660px" y="415px" label="CONTACT" onClick={(e: any) => handleBuildingClick('CONTACT', e)} />

        <MapItem type="tree" x="50px" y="450px" /><MapItem type="tree" x="330px" y="450px" /><MapItem type="tree" x="580px" y="450px" /><MapItem type="tree" x="850px" y="450px" />
        <MapItem type="tree" x="100px" y="200px" /><MapItem type="tree" x="250px" y="150px" /><MapItem type="tree" x="450px" y="120px" /><MapItem type="tree" x="650px" y="150px" /><MapItem type="tree" x="800px" y="200px" />
        <MapItem type="tree" x="180px" y="750px" /><MapItem type="tree" x="450px" y="750px" /><MapItem type="tree" x="700px" y="750px" />
      </div>
      {activeProject && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 animate-fadeIn p-4" onClick={handleClose}>
          <div className="bg-[#fff1e8] w-full max-w-3xl max-h-[80vh] rounded-xl border-4 border-[#5d4037] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#ffccaa] p-4 border-b-4 border-[#5d4037] flex justify-between items-center shrink-0">
              <h2 className="text-xs md:text-sm font-bold text-[#5d4037] uppercase tracking-widest">{activeProject.replace('_', ' ')}</h2>
              <button onClick={handleClose} className="bg-red-500 text-white px-3 py-2 rounded font-bold hover:bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-[10px] md:text-xs tracking-widest">CLOSE</button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto bg-[url('/assets/bg-pattern.png')] bg-white/50 flex-1 text-black">
              <div className="text-center text-[#5d4037]">Konten untuk {activeProject}...</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
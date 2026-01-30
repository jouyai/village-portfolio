'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { PORTFOLIO_CONTENT } from './content';

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
  minY: 550, maxY: 780  // Start below houses (houses end around y=473)
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getNewTarget = () => ({
  x: getRandomInt(WALK_AREA.minX, WALK_AREA.maxX),
  y: getRandomInt(WALK_AREA.minY, WALK_AREA.maxY),
});

const pixelStyle = { imageRendering: 'pixelated' } as const;

// ============================================
// HOUSE COMPONENT - OUTSIDE of Home to prevent re-renders
// ============================================
const House = memo(({ x, y, label, onClick }: { x: string; y: string; label: string; onClick: () => void }) => {
  return (
    <motion.div
      className="absolute flex flex-col items-center w-[160px] cursor-pointer"
      style={{ left: x, top: y, zIndex: 20 }}
      onClick={onClick}
      whileHover={{ zIndex: 50 }}
    >
      {/* Label - Always Bouncing */}
      <motion.div
        className="z-50 mb-2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="bg-[#fff1e8] border-2 border-[#5d4037] px-3 py-2 rounded-lg font-bold shadow-lg whitespace-nowrap text-[8px] md:text-[10px] text-[#5d4037] tracking-widest"
          whileHover={{ scale: 1.15, backgroundColor: '#ffccaa' }}
          transition={{ duration: 0.2 }}
        >
          ▼ {label}
        </motion.div>
      </motion.div>

      {/* House Image */}
      <motion.img
        src="/assets/env/house_topdown.png"
        className="w-full"
        style={{ ...pixelStyle, filter: 'drop-shadow(0 8px 5px rgba(0,0,0,0.3))' }}
        whileHover={{
          scale: 1.12,
          y: -12,
          filter: 'drop-shadow(0 18px 12px rgba(0,0,0,0.5))'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
      />
    </motion.div>
  );
});
House.displayName = 'House';

// ============================================
// TREE COMPONENT - Static, no animation
// ============================================
const Tree = memo(({ x, y }: { x: string; y: string }) => (
  <div
    className="absolute w-[90px] pointer-events-none z-10"
    style={{ left: x, top: y }}
  >
    <img
      src="/assets/env/tree_topdown.png"
      className="w-full drop-shadow-[0_8px_5px_rgba(0,0,0,0.3)]"
      style={pixelStyle}
    />
  </div>
));
Tree.displayName = 'Tree';

// ============================================
// BUSH COMPONENT - Three sizes
// ============================================
const Bush = memo(({ x, y, size = 'medium' }: { x: string; y: string; size?: 'large' | 'medium' | 'small' }) => {
  const sizeConfig = {
    large: { src: '/assets/env/bush_large.png', width: 'w-[100px]' },
    medium: { src: '/assets/env/bush_medium.png', width: 'w-[70px]' },
    small: { src: '/assets/env/bush_small.png', width: 'w-[50px]' },
  };
  const config = sizeConfig[size];

  return (
    <div
      className={`absolute ${config.width} pointer-events-none z-10`}
      style={{ left: x, top: y }}
    >
      <img
        src={config.src}
        className="w-full drop-shadow-[0_5px_3px_rgba(0,0,0,0.25)]"
        style={pixelStyle}
      />
    </div>
  );
});
Bush.displayName = 'Bush';

// ============================================
// CAMPFIRE COMPONENT - With flickering animation
// ============================================
const Campfire = memo(({ x, y }: { x: string; y: string }) => (
  <motion.div
    className="absolute w-[60px] pointer-events-none z-10"
    style={{ left: x, top: y }}
    animate={{ scale: [1, 1.05, 1, 0.95, 1] }}
    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <img
      src="/assets/env/campfire.png"
      className="w-full drop-shadow-[0_5px_8px_rgba(255,150,50,0.5)]"
      style={pixelStyle}
    />
  </motion.div>
));
Campfire.displayName = 'Campfire';

// ============================================
// WINDMILL COMPONENT - Decorative building
// ============================================
const Windmill = memo(({ x, y }: { x: string; y: string }) => (
  <div
    className="absolute w-[180px] pointer-events-none z-20"
    style={{ left: x, top: y }}
  >
    <img
      src="/assets/env/windmill.png"
      className="w-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.35)]"
      style={pixelStyle}
    />
  </div>
));
Windmill.displayName = 'Windmill';


// ============================================
// ROAD ITEM - Simple, no animation needed
// ============================================
const RoadItem = ({ type, x, y }: { type: string; x: string; y: string }) => {
  const typeMap: Record<string, string> = {
    'h': '/assets/env/road_h.png',
    'v': '/assets/env/road_v.png',
    'tl': '/assets/env/road_tl.png',
    'tr': '/assets/env/road_tr.png',
    'bl': '/assets/env/road_bl.png',
    'br': '/assets/env/road_br.png',
    't-up': '/assets/env/road_t_up.png'
  };
  const src = typeMap[type] || typeMap['h'];
  return (<img src={src} className="absolute w-[128px] h-[128px] pointer-events-none z-0 opacity-90" style={{ left: x, top: y, ...pixelStyle }} alt="road" />);
};

// ============================================
// CITIZEN RENDERER - Memoized
// ============================================
const CitizenRenderer = memo(({ data }: { data: CitizenData }) => {
  const backgroundX = `${data.frame * 20}%`;
  let backgroundY = '0%';
  let flipStyle = 'scaleX(1)';

  if (data.direction === 'down') { backgroundY = '0%'; }
  else if (data.direction === 'right') { backgroundY = '33.33%'; flipStyle = 'scaleX(-1)'; }
  else if (data.direction === 'up') { backgroundY = '66.66%'; }
  else if (data.direction === 'left') { backgroundY = '33.33%'; flipStyle = 'scaleX(1)'; }

  return (
    <div className="absolute pointer-events-none z-[15] flex items-end justify-center"
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
});
CitizenRenderer.displayName = 'CitizenRenderer';

// ============================================
// COLLISION BOXES - Houses and Trees
// ============================================
const HOUSE_BOXES = [
  { x: 148, y: 273, width: 160, height: 280 },  // ABOUT ME
  { x: 404, y: 273, width: 160, height: 280 },  // MY PROJECTS  
  { x: 660, y: 273, width: 160, height: 280 },  // CONTACT
];

const TREE_BOXES = [
  // Row at y=450
  { x: 50, y: 450, size: 90 },
  { x: 330, y: 450, size: 90 },
  { x: 580, y: 450, size: 90 },
  { x: 850, y: 450, size: 90 },
  // Row at y=150-200 (top trees)
  { x: 100, y: 200, size: 90 },
  { x: 250, y: 150, size: 90 },
  { x: 450, y: 120, size: 90 },
  { x: 650, y: 150, size: 90 },
  { x: 800, y: 200, size: 90 },
  // Row at y=750 (bottom trees)
  { x: 180, y: 750, size: 90 },
  { x: 450, y: 750, size: 90 },
  { x: 700, y: 750, size: 90 },
];

// Check if a point is inside any obstacle (house or tree)
const isInsideObstacle = (x: number, y: number): boolean => {
  // Check houses (with padding)
  const inHouse = HOUSE_BOXES.some(house =>
    x >= house.x - 50 &&
    x <= house.x + house.width + 50 &&
    y >= house.y - 50 &&
    y <= house.y + house.height + 50
  );

  // Check trees (with padding)
  const inTree = TREE_BOXES.some(tree =>
    x >= tree.x - 30 &&
    x <= tree.x + tree.size + 30 &&
    y >= tree.y - 30 &&
    y <= tree.y + tree.size + 30
  );

  // Check bushes (smaller padding)
  const BUSH_BOXES = [
    { x: 20, y: 350, size: 100 },   // large left
    { x: 920, y: 350, size: 100 },  // large right
    { x: 50, y: 550, size: 70 },
    { x: 280, y: 550, size: 50 },
    { x: 520, y: 540, size: 70 },
    { x: 780, y: 550, size: 50 },
    { x: 900, y: 540, size: 70 },
    { x: 350, y: 200, size: 50 },
    { x: 600, y: 200, size: 50 },
  ];

  const inBush = BUSH_BOXES.some(bush =>
    x >= bush.x - 20 &&
    x <= bush.x + bush.size + 20 &&
    y >= bush.y - 20 &&
    y <= bush.y + bush.size + 20
  );

  // Check campfire (centered in grass area)
  const inCampfire = x >= 450 && x <= 530 && y >= 500 && y <= 580;

  return inHouse || inTree || inBush || inCampfire;
};

// Get a valid target that's not inside any obstacle
const getValidTarget = (): { x: number; y: number } => {
  let target = getNewTarget();
  let attempts = 0;
  while (isInsideObstacle(target.x, target.y) && attempts < 20) {
    target = getNewTarget();
    attempts++;
  }
  return target;
};

// ============================================
// CITIZENS CONTAINER - Isolated re-renders
// ============================================
const CitizensContainer = () => {
  const [citizens, setCitizens] = useState<CitizenData[]>([]);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const initialCitizens: CitizenData[] = Array.from({ length: 8 }).map((_, index) => {
      const startPos = getValidTarget();
      const targetPos = getValidTarget();
      return {
        id: index,
        x: startPos.x,
        y: startPos.y,
        targetX: targetPos.x,
        targetY: targetPos.y,
        direction: 'down' as const,
        speed: getRandomInt(25, 55) / 100,
        frame: getRandomInt(0, 5),
        frameTimer: 0,
      };
    });
    setCitizens(initialCitizens);
  }, []);

  useEffect(() => {
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
            const newTarget = getValidTarget();
            return {
              ...citizen,
              targetX: newTarget.x,
              targetY: newTarget.y,
            };
          }

          let moveX = (dx / distance) * citizen.speed;
          let moveY = (dy / distance) * citizen.speed;

          // Check if next position would be inside an obstacle
          const nextX = citizen.x + moveX;
          const nextY = citizen.y + moveY;

          if (isInsideObstacle(nextX, nextY)) {
            // Redirect: find a new valid target
            const newTarget = getValidTarget();
            return {
              ...citizen,
              targetX: newTarget.x,
              targetY: newTarget.y,
              frame: newFrame,
              frameTimer: newFrameTimer
            };
          }

          let newDirection = citizen.direction;
          if (Math.abs(moveX) > Math.abs(moveY)) {
            newDirection = moveX > 0 ? 'right' : 'left';
          } else {
            newDirection = moveY > 0 ? 'down' : 'up';
          }

          return {
            ...citizen,
            x: nextX,
            y: nextY,
            direction: newDirection,
            frame: newFrame,
            frameTimer: newFrameTimer
          };
        })
      );
      requestRef.current = requestAnimationFrame(updateCitizens);
    };

    requestRef.current = requestAnimationFrame(updateCitizens);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      {citizens.map((citizen) => (
        <CitizenRenderer key={citizen.id} data={citizen} />
      ))}
    </>
  );
};

// ============================================
// PARTICLES - Client only
// ============================================
const Particles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${getRandomInt(5, 95)}%`,
      top: `${getRandomInt(10, 90)}%`,
      delay: getRandomInt(0, 5),
      duration: getRandomInt(3, 6),
      size: getRandomInt(3, 6),
    }));
    setParticles(generated);
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-yellow-200/60 pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 6px 2px rgba(255,255,150,0.5)',
          }}
          animate={{
            y: [0, -15, -5, -20, 0],
            x: [0, 10, -5, -10, 0],
            opacity: [0.4, 0.9, 0.6, 1, 0.4]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
        />
      ))}
    </>
  );
};

// ============================================
// MAIN HOME COMPONENT
// ============================================
export default function Home() {
  const [activeProject, setActiveProject] = useState<string | null>(null);

  const handleBuildingClick = (projectName: string) => {
    setActiveProject(projectName);
  };

  const handleClose = () => setActiveProject(null);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#2d5a2d] relative text-sm flex items-center justify-center selection:bg-[#5d4037] selection:text-white" style={{ backgroundImage: "url('/assets/env/grass_tile.png')", backgroundRepeat: 'repeat', backgroundSize: '128px', imageRendering: 'pixelated' }}>

      {/* Ambient Particles */}
      <Particles />

      {/* Title */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-[#fff1e8] border-4 border-[#5d4037] text-[#5d4037] px-6 py-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] pointer-events-none"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <h1 className="text-sm md:text-xl font-bold tracking-widest uppercase flex items-center gap-2 drop-shadow-sm">MY VILLAGE</h1>
      </motion.div>

      {/* Village Container */}
      <div className="relative w-[1000px] h-[800px] shrink-0 origin-center scale-[0.45] sm:scale-75 md:scale-100 transition-transform duration-500 ease-out">

        {/* Roads */}
        <RoadItem type="h" x="-78px" y="650px" />
        <RoadItem type="h" x="50px" y="650px" />
        <RoadItem type="t-up" x="178px" y="650px" />
        <RoadItem type="h" x="306px" y="650px" />
        <RoadItem type="t-up" x="434px" y="650px" />
        <RoadItem type="h" x="562px" y="650px" />
        <RoadItem type="t-up" x="690px" y="650px" />
        <RoadItem type="h" x="818px" y="650px" />
        <RoadItem type="h" x="946px" y="650px" />
        <RoadItem type="v" x="178px" y="522px" />
        <RoadItem type="v" x="434px" y="522px" />
        <RoadItem type="v" x="690px" y="522px" />

        {/* Citizens in isolated container */}
        <CitizensContainer />

        {/* Houses - Memoized, won't re-render with citizens */}
        <House x="148px" y="273px" label="ABOUT ME" onClick={() => handleBuildingClick('ABOUT')} />
        <House x="404px" y="273px" label="MY PROJECTS" onClick={() => handleBuildingClick('WEB_PROJECTS')} />
        <House x="660px" y="273px" label="CONTACT" onClick={() => handleBuildingClick('CONTACT')} />

        {/* Windmill - Center top, above houses */}
        <Windmill x="410px" y="80px" />

        {/* Trees - Static */}
        <Tree x="50px" y="450px" />
        <Tree x="330px" y="450px" />
        <Tree x="580px" y="450px" />
        <Tree x="850px" y="450px" />
        <Tree x="100px" y="200px" />
        <Tree x="250px" y="150px" />
        {/* <Tree x="450px" y="120px" /> */}
        <Tree x="650px" y="150px" />
        <Tree x="800px" y="200px" />
        <Tree x="180px" y="750px" />
        <Tree x="450px" y="750px" />
        <Tree x="700px" y="750px" />

        {/* Bushes - On grass areas, NOT on roads */}
        <Bush x="20px" y="350px" size="large" />
        <Bush x="920px" y="350px" size="large" />
        <Bush x="50px" y="550px" size="medium" />
        <Bush x="280px" y="550px" size="small" />
        <Bush x="520px" y="540px" size="medium" />
        <Bush x="780px" y="550px" size="small" />
        <Bush x="900px" y="540px" size="medium" />
        <Bush x="350px" y="200px" size="small" />
        <Bush x="600px" y="200px" size="small" />

        {/* Campfire - Center of grass area */}
        <Campfire x="600px" y="600px" />
      </div>

      {/* Modal */}
      {activeProject && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-[#fff1e8] w-full max-w-3xl max-h-[80vh] rounded-xl border-4 border-[#5d4037] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="bg-[#ffccaa] p-4 border-b-4 border-[#5d4037] flex justify-between items-center shrink-0">
              <h2 className="text-xs md:text-sm font-bold text-[#5d4037] uppercase tracking-widest">{activeProject.replace('_', ' ')}</h2>
              <button onClick={handleClose} className="bg-red-500 text-white px-3 py-2 rounded font-bold hover:bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-[10px] md:text-xs tracking-widest transition-all">CLOSE</button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto bg-white/50 flex-1 text-[#5d4037]">
              {/* ABOUT ME CONTENT */}
              {activeProject === 'ABOUT' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👋</div>
                    <h3 className="text-xl font-bold">{PORTFOLIO_CONTENT.about.name}</h3>
                    <p className="text-sm opacity-70">{PORTFOLIO_CONTENT.about.title}</p>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{PORTFOLIO_CONTENT.about.bio}</p>
                  <div>
                    <h4 className="font-bold mb-2 text-sm">🛠️ Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {PORTFOLIO_CONTENT.about.skills.map((skill, i) => (
                        <span key={i} className="bg-[#5d4037] text-white px-3 py-1 rounded-full text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-sm">🎓 Education</h4>
                    {PORTFOLIO_CONTENT.about.education.map((edu, i) => (
                      <div key={i} className="bg-white/50 p-3 rounded-lg">
                        <p className="font-bold text-sm">{edu.school}</p>
                        <p className="text-xs opacity-70">{edu.degree} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROJECTS CONTENT */}
              {activeProject === 'WEB_PROJECTS' && (
                <div className="space-y-4">
                  {PORTFOLIO_CONTENT.projects.map((project) => (
                    <div key={project.id} className="bg-white/70 p-4 rounded-lg border-2 border-[#5d4037]/20">
                      <h3 className="font-bold text-base mb-2">{project.title}</h3>
                      <p className="text-sm mb-3 opacity-80">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="bg-[#ffccaa] px-2 py-0.5 rounded text-xs">{tech}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="bg-[#5d4037] text-white px-3 py-1 rounded text-xs hover:bg-[#8d6e63] transition-colors">🌐 Live Demo</a>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors">🐙 GitHub</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CONTACT CONTENT */}
              {activeProject === 'CONTACT' && (
                <div className="space-y-6">
                  <p className="text-center text-sm">{PORTFOLIO_CONTENT.contact.message}</p>
                  <div className="space-y-3">
                    <div className="bg-white/70 p-3 rounded-lg flex items-center gap-3">
                      <span className="text-xl">📧</span>
                      <div>
                        <p className="text-xs opacity-70">Email</p>
                        <a href={`mailto:${PORTFOLIO_CONTENT.contact.email}`} className="font-bold text-sm hover:underline">{PORTFOLIO_CONTENT.contact.email}</a>
                      </div>
                    </div>
                    {PORTFOLIO_CONTENT.contact.phone && (
                      <div className="bg-white/70 p-3 rounded-lg flex items-center gap-3">
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="text-xs opacity-70">Phone</p>
                          <p className="font-bold text-sm">{PORTFOLIO_CONTENT.contact.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-white/70 p-3 rounded-lg flex items-center gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="text-xs opacity-70">Location</p>
                        <p className="font-bold text-sm">{PORTFOLIO_CONTENT.contact.location}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3 text-sm text-center">🔗 Social Links</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {PORTFOLIO_CONTENT.contact.socialLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="bg-[#5d4037] text-white px-4 py-2 rounded-lg text-xs hover:bg-[#8d6e63] transition-colors flex items-center gap-2">
                          <span>{link.icon}</span>
                          <span>{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
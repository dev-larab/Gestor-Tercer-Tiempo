import React, { useEffect, useRef, useState } from 'react';

interface DynamicBackgroundProps {
  intensity?: 'full' | 'subtle' | 'minimal';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

// Uiverse.io Realistic Bubble Cluster by Dennyhml
const BubbleCluster: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
}> = ({ className = '', style, scale = 1 }) => {
  const customTransform = style?.transform;
  const finalTransform = scale !== 1
    ? (customTransform ? `${customTransform} scale(${scale})` : `scale(${scale})`)
    : customTransform;

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{
        ...style,
        transform: finalTransform,
        transformOrigin: 'center center'
      }}
    >

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bubble">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      ))}
    </div>
  );
};

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  intensity = 'full'
}) => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false
  });

  // Track reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Canvas particle animation (stadium floodlight night mist & sparks)
  useEffect(() => {
    if (reducedMotion || intensity === 'minimal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particle colors matching La Única's emerald, mint, electric green and stadium floodlight glow
    const colors = [
      'rgba(16, 185, 129,',   // Emerald
      'rgba(52, 211, 153,',   // Mint
      'rgba(5, 150, 105,',    // Forest
      'rgba(110, 231, 183,',  // Bright mint
      'rgba(240, 253, 244,'   // Floodlight white-green
    ];

    const particleCount = intensity === 'full' ? (width < 768 ? 25 : 45) : (width < 768 ? 14 : 24);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.45 + 0.15), // Slow upward drift like stadium turf vapor
        size: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
        alpha: 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let lastTime = performance.now();
    let isTabVisible = true;

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.pulsePhase += p.pulseSpeed;

        // Subtle gentle oscillation
        p.x += Math.sin(p.pulsePhase * 0.7) * 0.2;

        // Soft cursor deflection
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;

          if (dist < maxDist && dist > 1) {
            const force = (1 - dist / maxDist) * 1.2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Loop around edges
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Breathing alpha
        const currentAlpha = Math.max(
          0.05,
          p.baseAlpha + Math.sin(p.pulsePhase) * 0.15
        );

        // Draw particle with gentle radial glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentAlpha})`;
        ctx.shadowBlur = p.size * 3.5;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reducedMotion, intensity]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Athletic Base Gradient (UPNA green/black turf tones) */}
      <div className="absolute inset-0 bg-[#080d0a] bg-gradient-to-b from-[#060a08] via-[#09110d] to-[#050806]" />

      {/* 2. Micro Dot Matrix Pattern (tactical sports board feel) */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(52, 211, 153, 0.25) 1px, transparent 0)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* 3. Subtle Rugby Pitch Vector Geometry Lines */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.06] text-emerald-400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pitchLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <pattern id="diagonalHatch" width="120" height="120" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="6 12" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#diagonalHatch)" />

        {/* Rugby pitch markings: Midfield line, 22m lines & try lines */}
        <line x1="10%" y1="0" x2="10%" y2="100%" stroke="url(#pitchLineGrad)" strokeWidth="1.5" strokeDasharray="8 6" />
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="url(#pitchLineGrad)" strokeWidth="1" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#pitchLineGrad)" strokeWidth="2" />
        <circle cx="50%" cy="50%" r="90" stroke="url(#pitchLineGrad)" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="url(#pitchLineGrad)" strokeWidth="1" />
        <line x1="90%" y1="0" x2="90%" y2="100%" stroke="url(#pitchLineGrad)" strokeWidth="1.5" strokeDasharray="8 6" />
      </svg>

      {/* 4. Moving Aurora / Luminous Stadium Gradient Orbs */}
      {!reducedMotion && (
        <>
          {/* Top-Left Emerald Floodlight Orb */}
          <div 
            className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[120px] opacity-40 bg-gradient-to-br from-emerald-500/25 via-emerald-600/15 to-transparent animate-aurora-drift-1 transform-gpu pointer-events-none"
          />

          {/* Bottom-Right Deep Teal & Forest Orb */}
          <div 
            className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full blur-[140px] opacity-35 bg-gradient-to-tl from-teal-500/20 via-emerald-700/15 to-transparent animate-aurora-drift-2 transform-gpu pointer-events-none"
          />

          {/* Center-Top Breathing Stadium Floodlight */}
          <div 
            className="absolute top-[18%] left-[45%] -translate-x-1/2 w-[600px] h-[380px] rounded-full blur-[130px] opacity-25 bg-gradient-to-b from-emerald-400/20 via-teal-600/10 to-transparent animate-aurora-breathe transform-gpu pointer-events-none"
          />

          {/* Accent Gold/Amber Touch (representing the Club's 3rd half & trophy spirit) */}
          <div 
            className="absolute bottom-[25%] left-[8%] w-[400px] h-[400px] rounded-full blur-[110px] opacity-15 bg-gradient-to-tr from-amber-500/15 via-emerald-500/10 to-transparent animate-aurora-drift-3 transform-gpu pointer-events-none"
          />

          {/* Stadium Light Shimmer Wave passing across */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/[0.035] to-transparent animate-field-sweep pointer-events-none"
          />
        </>
      )}

      {/* 5. Uiverse.io Realistic 3D Glass Bubbles Effect by Dennyhml */}
      {!reducedMotion && intensity !== 'minimal' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {/* Cluster 1 - Upper Right */}
          <BubbleCluster 
            className="absolute top-[14%] right-[10%] animate-cluster-drift-a"
            scale={0.85}
          />

          {/* Cluster 2 - Lower Left */}
          <BubbleCluster 
            className="absolute bottom-[20%] left-[6%] animate-cluster-drift-b"
            scale={0.75}
          />

          {/* Cluster 3 - Center Right */}
          {intensity === 'full' && (
            <BubbleCluster 
              className="absolute top-[50%] right-[16%] animate-cluster-drift-b hidden md:block"
              scale={0.6}
            />
          )}

          {/* Cluster 4 - Upper Left */}
          {intensity === 'full' && (
            <BubbleCluster 
              className="absolute top-[26%] left-[16%] animate-cluster-drift-a hidden lg:block"
              scale={0.55}
            />
          )}
        </div>
      )}

      {/* 6. Interactive Night Atmosphere Floating Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]" 
      />

      {/* 7. Vignette falloff to keep all UI cards and typography high-contrast & razor-sharp */}
      <div 
        className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/55 pointer-events-none z-[3]"
      />

    </div>
  );
};

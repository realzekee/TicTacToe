import { useEffect, useRef } from 'react';
import { ThemeId } from '../types';

interface ParticleEffectProps {
  winner: 'X' | 'O' | 'Draw' | null;
  themeId: ThemeId;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  shape: 'circle' | 'square' | 'ring' | 'star';
  rotation: number;
  rotationSpeed: number;
}

export default function ParticleEffect({ winner, themeId }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!winner) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color selectors based on theme
    const getThemeColors = (tid: ThemeId): string[] => {
      switch (tid) {
        case 'slate':
          return ['#10b981', '#34d399', '#059669', '#22d3ee', '#06b6d4'];
        case 'synthwave':
          return ['#ec4899', '#f43f5e', '#d946ef', '#22d3ee', '#38bdf8', '#fbbf24'];
        case 'nordic':
          return ['#cc6655', '#dd8877', '#446655', '#558866', '#d4cfc9'];
        case 'brutalist':
          return ['#000000', '#ffffff', '#ffff00', '#00ffff', '#ff00ff'];
        case 'cyberpunk':
          return ['#fcee0a', '#00f0ff', '#ff0055', '#33ff33'];
        case 'sakura':
          return ['#f43f5e', '#fb7185', '#f472b6', '#fbcfe8', '#ffffff', '#fcd34d'];
        default:
          return ['#10b981', '#22d3ee', '#3b82f6'];
      }
    };

    const colors = getThemeColors(themeId);

    // Spawn burst
    const numParticles = winner === 'Draw' ? 60 : 150;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;

    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + (winner === 'Draw' ? 2 : 5);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      let shape: 'circle' | 'square' | 'ring' | 'star' = 'circle';
      if (themeId === 'brutalist' || themeId === 'cyberpunk') {
        shape = Math.random() > 0.4 ? 'square' : 'circle';
      } else if (themeId === 'synthwave') {
        const rand = Math.random();
        shape = rand < 0.3 ? 'ring' : rand < 0.6 ? 'star' : 'circle';
      } else if (themeId === 'sakura') {
        shape = Math.random() > 0.5 ? 'star' : 'circle'; // petals represent rose stars
      } else {
        shape = Math.random() > 0.7 ? 'ring' : 'circle';
      }

      particles.push({
        x: originX,
        y: originY + (Math.random() * 80 - 40), // slightly offset
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (winner === 'Draw' ? 1 : 4), // give upward explosive bias
        color,
        size: Math.random() * (themeId === 'brutalist' ? 12 : 8) + 4,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Physics update
        p.x += p.vx;
        p.vx *= 0.98; // friction
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size / 4;

        // Custom theme shadows (Synthwave glow, brutalist solid borders)
        if (themeId === 'synthwave' || themeId === 'cyberpunk') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
        } else if (themeId === 'brutalist') {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
        }

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          if (themeId === 'brutalist') ctx.stroke();
        } else if (p.shape === 'square') {
          ctx.beginPath();
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fill();
          ctx.stroke();
        } else if (p.shape === 'ring') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.shape === 'star') {
          drawStar(0, 0, 5, p.size / 2, p.size / 4);
        }

        ctx.restore();
      });

      // Filter out completed particles
      particles = particles.filter((p) => p.alpha > 0);

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [winner, themeId]);

  if (!winner) return null;

  return (
    <canvas
      ref={canvasRef}
      id="victory-particle-canvas"
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}

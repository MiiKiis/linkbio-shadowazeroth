'use client';

import { useEffect, useRef } from 'react';

interface ParticlesProps {
  color1?: string;
  color2?: string;
}

export default function ParticlesCanvas({ color1 = '#bf00ff', color2 = '#00ffff' }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: any[] = [];
    const particleCount = 100;
    const mouseRadius = 200;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      if (!canvas) return;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 4 + 1.5, 
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.5 ? color1 : color2,
        originalVx: 0,
        originalVy: 0,
      };
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const p = createParticle()!;
        p.originalVx = p.vx;
        p.originalVy = p.vy;
        particles.push(p);
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseRadius - distance) / mouseRadius;
          const directionX = forceDirectionX * force * 5;
          const directionY = forceDirectionY * force * 5;
          p.x -= directionX;
          p.y -= directionY;
        }

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.2, p.color + '88');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    window.addEventListener('resize', () => { resize(); init(); });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color1, color2]);

  return <canvas ref={canvasRef} id="particles-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }} />;
}



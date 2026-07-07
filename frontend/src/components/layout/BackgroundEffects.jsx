import React, { useEffect, useState } from 'react';

export const BackgroundEffects = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 12 random floating ambient particles
    const items = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 250 + 150, // 150px to 400px blobs
      x: Math.random() * 100, // percentage x
      y: Math.random() * 100, // percentage y
      duration: Math.random() * 25 + 20, // 20s to 45s float duration
      delay: Math.random() * -20, // start immediately at different phases
      color: i % 3 === 0 
        ? 'rgba(99, 102, 241, 0.08)' // Indigo
        : i % 3 === 1 
          ? 'rgba(139, 92, 246, 0.06)' // Purple
          : 'rgba(236, 72, 153, 0.04)', // Pink
    }));
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Subtle scanning grid lines overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial overlay to dim the center and emphasize borders */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(10, 15, 30, 0.15) 100%)'
        }}
      />

      {/* Floating Blobs */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full blur-[100px] animate-float"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundEffects;

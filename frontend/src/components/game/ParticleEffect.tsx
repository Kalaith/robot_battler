import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  position: { x: number; y: number };
  type: 'hit' | 'critical' | 'heal' | 'explosion';
  onComplete: () => void;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  trigger,
  position,
  type,
  onComplete,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = [];
    const particleCount =
      type === 'explosion' ? 20 : type === 'critical' ? 15 : 10;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = Math.random() * 3 + 2;
      const size = Math.random() * 4 + 2;

      let color = '#ff4444';
      switch (type) {
        case 'critical':
          color = '#ffff44';
          break;
        case 'heal':
          color = '#44ff44';
          break;
        case 'explosion':
          color = i % 2 === 0 ? '#ff8844' : '#ff4444';
          break;
      }

      newParticles.push({
        id: `particle-${i}`,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size,
        life: 1,
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [trigger, position, type, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: particle.x + particle.vx * 50,
              y: particle.y + particle.vy * 50,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

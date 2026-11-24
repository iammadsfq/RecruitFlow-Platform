import React, { useState } from 'react';
import { motion } from 'motion/react';

const SPARK_ANGLES = [0, 35, 72, 115, 150, 190, 228, 265, 305, 338];

/**
 * SakugaButton — Anime-inspired VFX button (squash-and-stretch spring physics,
 * radial speed/impact lines, expanding shockwave ring, and optional impact callout).
 */
export function SakugaButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  sparkColor = '#FFCC00',
  impactText = '',
  ...rest
}) {
  const [bursts, setBursts] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
    const id = `${Date.now()}_${Math.random()}`;

    setBursts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 650);

    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled ? undefined : { scaleX: 1.07, scaleY: 0.91 }}
      transition={{ type: 'spring', stiffness: 520, damping: 20 }}
      className={`relative overflow-visible select-none ${className}`}
      {...rest}
    >
      {children}

      {/* Sakuga VFX Burst Layer */}
      {bursts.map((b) => (
        <span
          key={b.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible z-30"
        >
          {/* Shockwave impact ring */}
          <span
            className="sakuga-ring absolute w-8 h-8 rounded-full border-2"
            style={{ left: b.x, top: b.y, borderColor: sparkColor }}
          />
          {/* Radial anime impact lines */}
          {SPARK_ANGLES.map((angle, i) => (
            <span
              key={angle}
              className="sakuga-spark absolute rounded-full"
              style={{
                left: b.x,
                top: b.y,
                width: i % 2 === 0 ? '3px' : '2px',
                height: i % 2 === 0 ? '14px' : '9px',
                backgroundColor: i % 3 === 0 ? '#FFFFFF' : sparkColor,
                '--angle': `${angle}deg`,
                '--dist': i % 2 === 0 ? '38px' : '26px',
              }}
            />
          ))}
          {/* Optional manga/anime impact pop text */}
          {impactText && (
            <span
              className="sakuga-pop-tag absolute px-2 py-0.5 rounded-md bg-[#172033] text-[#FFCC00] font-display font-extrabold text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap"
              style={{ left: b.x, top: b.y }}
            >
              {impactText}
            </span>
          )}
        </span>
      ))}
    </motion.button>
  );
}

/**
 * SakugaCard — Hairline-bordered container with subtle spring lift on hover.
 */
export function SakugaCard({ children, className = '', onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={`hairline-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

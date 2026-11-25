import React, { useState } from 'react';
import { motion } from 'motion/react';

/**
 * SakugaButton — Tactile spring physics (squash-and-stretch),
 * crisp yellow/navy spark particles, and shockwave ring on click.
 */
export function SakugaButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  popText = '',
  variant = 'primary',
}) {
  const [bursts, setBursts] = useState([]);

  const triggerBurst = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
    const id = Date.now() + Math.random();
    const sparks = Array.from({ length: 8 }, (_, idx) => ({
      angle: `${idx * 45 + (Math.random() * 14 - 7)}deg`,
      dist: `${22 + Math.random() * 16}px`,
      w: idx % 2 === 0 ? 3 : 2,
      h: idx % 2 === 0 ? 11 : 7,
      color: variant === 'navy' ? '#FFCC00' : idx % 2 === 0 ? '#FFCC00' : '#172033',
    }));
    setBursts((prev) => [...prev, { id, x, y, sparks }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 650);
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={triggerBurst}
      whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled ? undefined : { scaleX: 1.06, scaleY: 0.92 }}
      transition={{ type: 'spring', stiffness: 520, damping: 22 }}
      className={`relative overflow-visible select-none ${className}`}
    >
      {children}
      {bursts.map((b) => (
        <span
          key={b.id}
          className="pointer-events-none absolute inset-0 overflow-visible z-30"
          aria-hidden="true"
        >
          <span
            className="sakuga-ring absolute w-8 h-8 rounded-full border-2"
            style={{
              left: b.x,
              top: b.y,
              borderColor: variant === 'navy' ? '#FFCC00' : '#172033',
            }}
          />
          {b.sparks.map((sp, idx) => (
            <span
              key={idx}
              className="sakuga-spark absolute rounded-full"
              style={{
                left: b.x,
                top: b.y,
                width: sp.w,
                height: sp.h,
                backgroundColor: sp.color,
                '--angle': sp.angle,
                '--dist': sp.dist,
              }}
            />
          ))}
          {popText && (
            <span
              className="sakuga-pop-tag absolute font-display font-extrabold text-[11px] px-2 py-0.5 rounded bg-[#172033] text-[#FFCC00] shadow-md whitespace-nowrap"
              style={{ left: b.x, top: b.y - 10 }}
            >
              {popText}
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
